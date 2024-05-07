// *****************************************************************************
// This model is responsible for reading all of the data from the provided
// .qza/.qzv. It takes their input and turns it into something it can interpret
// then provides various bits of information about the provided .qza/.qzv on
// request.
// *****************************************************************************
import yaml from "js-yaml";
import JSZip from "jszip";

import { handleError, readBlobAsText } from "$lib/scripts/util";
import extmap from "$lib/scripts/extmap";
import schema from "$lib/scripts/yaml-schema";

interface ResultDetails {
  name: string | null;
  uuid: string;
  type: string;
  format: string | null;
}

class ReaderModel {
  error = "";
  errorMessage = "";

  rawSrc: File | string = "";
  urlSrc = "";
  name: string = "";
  sourceType: string = "";

  uuid: string = "";
  indexPath: string = "";
  version: string = "";
  frameworkVersion: string = "";
  zipReader: JSZip | null = null;
  port: string | null = null;

  citations: string | undefined = undefined;
  metadata: object = {};

  session: string;

  height: number | undefined = undefined;
  elements: Array<Object> | undefined = undefined;

  provData: Object | undefined = undefined;
  provTitle: string = "Details";

  seenInputExecutionIDs = new Set();

  //***************************************************************************
  // Start boilerplate to make this a subscribable svelte store
  //***************************************************************************
  _subscription: Record<number, (arg0: ReaderModel) => void> = {};
  _subscriptionNum = 0;

  _dirty() {
    for (const subscription of Object.values(this._subscription)) {
      subscription(this);
    }
  }

  subscribe(subscription: (value: ReaderModel) => void): () => void {
    this._subscription[this._subscriptionNum] = subscription;
    subscription(this);
    return ((index) => {
      return () => {
        delete this._subscription[index];
      };
    })(this._subscriptionNum++);
  }
  //***************************************************************************
  // End boilerplate to make this a subscribable svelte store
  //***************************************************************************

  constructor() {
    this.session = Math.random().toString(36).substr(2);
  }

  clear() {
    this.error = "";
    this.errorMessage = "";

    this.rawSrc = "";
    this.urlSrc = "";
    this.name = "";
    this.sourceType = "";

    this.uuid = "";
    this.indexPath = "";
    this.version = "";
    this.frameworkVersion = "";
    this.zipReader = null;
    this.port = null;

    this.citations = undefined;
    this.metadata = {};

    this.height = undefined;
    this.elements = undefined;

    this.provData = undefined;
    this.provTitle = "Details";

    this.seenInputExecutionIDs = new Set();

    this._dirty();
  }

  async readData(src: File | string, tab: string) {
    try {
      // We deal with this before actually reading the data so we can persist
      // this state on the error page. It makes it so if they reload the error
      // page it tries to read the bad data again and produces the error again.
      if (!(src instanceof File)) {
        this._setRemoteSrc(src);
      }

      let data = src instanceof File ? src : await this._readRemoteData(src);
      await this.initModelFromData(data);

      if (src instanceof File) {
        this._setLocalSrc(src);
      }
    } catch (err: any) {
      handleError(err);
      return;
    }

    // We set this after reading the data because sometimes which tab we go to
    // is dependent on whether we read an artifact or a visualization and we
    // don't have a great way of knowing that for certain until we've actually
    // read it
    if (src instanceof File) {
      this._setLocalTab();
    } else {
      this._setRemoteTab(tab);
    }

    this._dirty();
  }

  async _readRemoteData(src: string) {
    const sourceURL = new URL(src);

    // Handle potential DropBox URL weirdness to do with search params
    if (sourceURL.hostname === "www.dropbox.com") {
      sourceURL.searchParams.set("dl", "1");
      const path = `${sourceURL.pathname}?${sourceURL.searchParams}`;
      src = `https://dl.dropboxusercontent.com${path}`;
    }

    return await this._getRemoteFile(src);
  }

  _setLocalSrc(src: File) {
    this.urlSrc = this.uuid;
    this.name = src.name;
    this.sourceType = "local";
    this.rawSrc = src;
  }

  _setLocalTab() {
    let tab = this._getTab();

    // Pushes state because this change necesarily happened to move from the
    // root page to the new default page for the provided file
    history.pushState({}, "", `/${tab}/?src=${this.urlSrc}`);
  }

  _setRemoteSrc(src: string) {
    this.urlSrc = src;
    this.name = this.parseFileNameFromURL(src);
    this.sourceType = "remote";
    this.rawSrc = src;
  }

  _setRemoteTab(tab: string) {
    // If we were not given a tab then revert to the default behavior
    if (!tab) {
      tab = this._getTab();
    }

    // TODO: I think there is a bit of hairiness here. We only want to push
    // state if we are loading this file from the root of the page not if this
    // was loaded due to a navigation event (back or forward arrow or pasting URL)
    //
    // NOTE: Thing that is for sure happening. If you open a remote source viz
    // then open a different viz then use the back arrow to navigate back to the prior
    // remote source viz then if you were on the input page with that prior
    // remote source viz loaded it will load the vizualization page with that viz
    // not the input page
    //
    // STEPS:
    //  1: select a gallery viz
    //  2: click the qiime2 logo to go back to the input page
    //  3: drop in a local viz
    //  4: hit the back arrow
    history.replaceState({}, "", `/${tab}/?src=${this.urlSrc}`);
  }

  _getTab() {
    // If we have an index path we are a visualization and auto redirect to that
    // tab otherwise we are an artifact and auto redirect to the details tab
    return this.indexPath ? "visualization" : "details";
  }

  async _getRemoteFile(url: string): Promise<Blob> {
    return await fetch(url).then((response) => {
      if (!response.ok) {
        throw Error(`Network error, recieved ${response.status} from server.`);
      }

      return response.blob();
    });
  }

  private parseFileNameFromURL(url: string): string {
    let fileName = new URL(url).pathname.split("/").pop();

    if (fileName === undefined) {
      throw Error(`Could not get filename from the URL ${url}`);
    }

    return fileName;
  }

  async initModelFromData(data: File | Blob) {
    const jsZip = new JSZip();
    const zip = await jsZip.loadAsync(data);
    const error = new Error("Not a valid QIIME 2 archive.");

    // Verify layout:
    // 1) Root dir named with UUID, only object in zip root
    // 2) UUID dir has a file named `VERSION`
    const files = Object.keys(zip.files);
    const parsedPaths = [];
    files.forEach((f) => {
      const fileParts = f.split("/");
      for (let i = 1; i <= fileParts.length; i += 1) {
        parsedPaths.push(fileParts.slice(0, i).join("/"));
      }
    });
    const uniquePaths = parsedPaths.filter(
      (value, index, self) => self.indexOf(value) === index,
    );

    // http://stackoverflow.com/a/13653180
    const uuidRegEx =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; // eslint-disable-line max-len
    let allInUUID = true;
    uniquePaths.every((path) => {
      const parts = path.split("/");
      if (!uuidRegEx.test(parts[0])) {
        allInUUID = false;
        return false; // break
      }
      return true;
    });

    // If every path has UUID, then proceed
    if (!allInUUID) {
      throw error;
    }

    const UUID = uniquePaths[0].split("/")[0];

    // Search for VERSION file
    if (uniquePaths.find((path) => path === `${UUID}/VERSION`) === undefined) {
      throw error;
    }

    this.uuid = UUID;
    this.zipReader = zip;

    // Set Metadata
    this.metadata = await this._getYAML("metadata.yaml");

    // Determine if we have a visualization or an artifact
    if (this.metadata["type"] === "Visualization") {
      this.indexPath = `/_/${this.session}/${UUID}/data/index.html`;
    } else {
      this.indexPath = "";
    }

    // Set Citations
    const citations = await this._getCitations();
    this.citations = this._dedup(citations);

    const provData = await this.getProvenanceTree();
    this.height = provData[0];
    this.elements = provData[1];
  }

  attachToServiceWorker() {
    window.navigator.serviceWorker.onmessage = (event) => {
      if (event.data.session !== this.session) {
        return; // This message is meant for another tab.
      }
      switch (event.data.type) {
        // TODO: There is currently a bug where when you switch between URL sources
        // GET_DATA is triggered for files that were in the previous index.html but with
        // the current uuid. No idea why. It doesn't cause real problems just outputs
        // errors to the console
        case "GET_DATA":
          // decode should go in the SW, but that'd require an upgrade
          this._getFile(decodeURI(event.data.filename))
            .then((data) => {
              // the request should provide a port for later response
              event.ports[0].postMessage(data);
            })
            .catch((error) => {
              console.error(error);
              // Post a "we got an error" response asap to avoid the browser
              // waiting on a file that will never exist
              event.ports[0].postMessage({ data: "", type: "error" });
            }); // eslint-disable-line no-console
          break;
        default:
          console.log(`Unknown SW event type: ${event.data.type}`); // eslint-disable-line no-console
          break;
      }
    };
  }

  _getFile(relpath) {
    const ext = relpath.split(".").pop();
    const fp = `${this.uuid}/${relpath}`;
    const filehandle = this.zipReader.file(fp);
    let filepromise = null;
    if (filehandle === null) {
      filepromise = () => Promise.reject(`No such file: ${fp}`);
    } else {
      filepromise = () => filehandle.async("uint8array");
    }
    return filepromise().then((byteArray) => ({
      byteArray,
      type: extmap[ext] || "",
    }));
  }

  _getYAML(relpath) {
    return this._getFile(relpath)
      .then((data) => new Blob([data.byteArray], { type: data.type }))
      .then(readBlobAsText)
      .then((text) => yaml.safeLoad(text, { schema }));
  }

  getCitations() {
    if (this.citations !== undefined) {
      return this.citations;
    }

    return this._getCitations().then((citations) => {
      this.citations = this._dedup(citations);
      return this.citations;
    });
  }

  _getCitations() {
    if (this.zipReader.file(`${this.uuid}/provenance/citations.bib`) === null) {
      return Promise.resolve(null);
    }
    const promises = [];
    this.zipReader
      .folder(`${this.uuid}/provenance/`)
      .forEach((relPath, file) => {
        if (relPath.endsWith("citations.bib")) {
          promises.push(file.async("text"));
        }
      });

    return Promise.all(promises).then((array) => array.join(""));
  }

  _dedup(bibtex) {
    const store = {};
    const dedup = [];

    let skip = false;
    for (const line of bibtex.split("\n")) {
      if (line.startsWith("@")) {
        skip = false;
        const id = /@.*{(.*),\w*/.exec(line)[0];

        if (id in store) {
          skip = true;
        } else {
          store[id] = true;
        }
      }

      if (!skip) {
        dedup.push(line);
      }
    }
    return dedup.join("\n");
  }

  getURLOfPath(relpath) {
    return `/_/${this.session}/${this.uuid}/${relpath}`;
  }

  _inputMap(uuid, action) {
    // Recurse up the prov tree and get mappings of execution id to the inputs
    // that execution took
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      if (action === undefined) {
        this.getProvenanceAction(uuid)
          .then((action) => this._inputMapHelper(uuid, action, resolve))
          .catch(() => resolve({ iList: {}, aList: {} }));
      } else {
        this._inputMapHelper(uuid, action, resolve);
      }
    });
  }

  _inputMapHelper(uuid, action, resolve) {
    const inputs = {};

    const artifactsToAction = {};
    artifactsToAction[uuid] = action.execution.uuid;

    if (
      action.action.type === "method" ||
      action.action.type === "visualizer" ||
      action.action.type === "pipeline"
    ) {
      inputs[action.execution.uuid] = new Set();
      const promises = [];
      for (const inputMap of action.action.inputs) {
        const entry = Object.values(inputMap)[0];
        const inputName = Object.keys(inputMap)[0];
        if (typeof entry === "string") {
          inputs[action.execution.uuid].add(inputMap);
          promises.push(
            this.getProvenanceAction(entry).then((innerAction) => {
              if (!this.seenInputExecutionIDs.has(innerAction.execution.uuid)) {
                this.seenInputExecutionIDs.add(innerAction.execution.uuid);
                return this._inputMap(entry, innerAction);
              } else {
                return new Promise((resolve, reject) =>
                  resolve({
                    iList: {},
                    aList: { [entry]: innerAction.execution.uuid },
                  }),
                );
              }
            }),
          );
        } else if (entry !== null) {
          for (const e of entry) {
            if (typeof e !== "string") {
              // If we are here, this was a collection and each e is a
              // key, value pair
              const key = Object.keys(e)[0];
              const value = Object.values(e)[0];

              inputs[action.execution.uuid].add({
                [`${inputName}_${key}`]: value,
              });

              // TODO: This should prevent us from parsing the same prov tree
              // for every element of the collection if the collection has
              // a large number of artifacts that came from the same action.
              // This does do some redundent work if the collection was completely
              // ad hoc, but it saves substantial time if the collection was
              // a single ResultCollection from another action
              promises.push(
                this.getProvenanceAction(value).then((innerAction) => {
                  if (
                    !this.seenInputExecutionIDs.has(innerAction.execution.uuid)
                  ) {
                    this.seenInputExecutionIDs.add(innerAction.execution.uuid);
                    return this._inputMap(value, innerAction);
                  } else {
                    return new Promise((resolve, reject) =>
                      resolve({
                        iList: {},
                        aList: { [value]: innerAction.execution.uuid },
                      }),
                    );
                  }
                }),
              );
            } else {
              inputs[action.execution.uuid].add({ [inputName]: e });
              promises.push(
                this.getProvenanceAction(e).then((innerAction) => {
                  if (
                    !this.seenInputExecutionIDs.has(innerAction.execution.uuid)
                  ) {
                    this.seenInputExecutionIDs.add(innerAction.execution.uuid);
                    return this._inputMap(e, innerAction);
                  } else {
                    return new Promise((resolve, reject) =>
                      resolve({
                        iList: {},
                        aList: { [e]: innerAction.execution.uuid },
                      }),
                    );
                  }
                }),
              );
            }
          }
        } // else optional artifact
      }
      for (const paramMap of action.action.parameters) {
        const paramName = Object.keys(paramMap)[0];
        const param = Object.values(paramMap)[0];
        if (
          param !== null &&
          typeof param === "object" &&
          Object.prototype.hasOwnProperty.call(param, "artifacts")
        ) {
          for (const artifactUUID of param.artifacts) {
            inputs[action.execution.uuid].add({
              [paramName]: artifactUUID,
            });

            promises.push(
              this.getProvenanceAction(artifactUUID).then((innerAction) => {
                if (
                  !this.seenInputExecutionIDs.has(innerAction.execution.uuid)
                ) {
                  this.seenInputExecutionIDs.add(innerAction.execution.uuid);
                  return this._inputMap(artifactUUID, innerAction);
                } else {
                  return new Promise((resolve, reject) =>
                    resolve({
                      iList: {},
                      aList: { [artifactUUID]: innerAction.execution.uuid },
                    }),
                  );
                }
              }),
            );
          }
        }
      }
      if (promises.length !== 0) {
        Promise.all(promises)
          .then((results) => {
            let iRet = { ...inputs };
            let aRet = { ...artifactsToAction };

            for (const result of results) {
              let iList = result["iList"];
              let aList = result["aList"];

              iRet = { ...iRet, ...iList };
              aRet = { ...aRet, ...aList };
            }

            return { iList: iRet, aList: aRet };
          })
          .then(resolve);
      } else {
        resolve({ iList: inputs, aList: artifactsToAction }); // no artifacts involved
      }
    } else {
      resolve({ iList: inputs, aList: artifactsToAction });
    }
  }

  getProvenanceTree() {
    return Promise.all([this._inputMap(this.uuid, undefined)]).then(
      ([result]) => {
        let actions = result["iList"];
        let artifacts = result["aList"];

        console.log("HERE");
        console.log(actions);
        console.log(artifacts);

        const findMaxDepth = (uuid) => {
          if (
            artifacts[uuid] === null ||
            typeof actions[artifacts[uuid]] === "undefined"
          ) {
            return 0;
          }
          return (
            1 +
            Math.max(
              ...Array.from(actions[artifacts[uuid]]).map((mapping) =>
                findMaxDepth(Object.values(mapping)[0]),
              ),
            )
          );
        };

        let height = findMaxDepth(this.uuid);
        let nodes = [];
        let edges = [];
        const actionNodes = [];

        for (const actionUUID of Object.keys(actions)) {
          for (const mapping of actions[actionUUID]) {
            edges.push({
              data: {
                id: `${Object.keys(mapping)[0]}_${
                  Object.values(mapping)[0]
                }to${actionUUID}`,
                param: Object.keys(mapping)[0],
                source: Object.values(mapping)[0],
                target: actionUUID,
              },
            });
          }
        }

        for (const actionUUID of Object.values(artifacts)) {
          // These don't need to be sorted.
          if (actionUUID !== null) {
            actionNodes.push({
              data: { id: actionUUID },
            });
          }
        }

        for (const artifactUUID of Object.keys(artifacts)) {
          nodes.push({
            data: {
              id: artifactUUID,
              parent: artifacts[artifactUUID],
              row: findMaxDepth(artifactUUID),
            },
          });
        }

        for (let i = 0; i < height; i += 1) {
          const currNodes = nodes.filter((v) => v.data.row === i);
          const sorted = currNodes.sort((a, b) => {
            if (a.data.parent < b.data.parent) {
              return -1;
            } else if (a.data.parent > b.data.parent) {
              return 1;
            }
            return 0;
          });

          for (const n of currNodes) {
            n.data.col = sorted.indexOf(n);
          }
        }

        nodes = [...actionNodes, ...nodes];
        let elements = nodes.concat(edges);

        return [height, elements];
      },
    );
  }

  getProvenanceAction(uuid) {
    if (this.uuid === uuid) {
      return this._getYAML("provenance/action/action.yaml");
    }
    return this._getYAML(`provenance/artifacts/${uuid}/action/action.yaml`);
  }

  getProvenanceArtifact(uuid) {
    if (this.uuid === uuid) {
      return this._getYAML("provenance/metadata.yaml");
    }
    return this._getYAML(`provenance/artifacts/${uuid}/metadata.yaml`);
  }
}

// Create a singleton version of the reader for this session
const readerModel = new ReaderModel();
export default readerModel;
