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

  actionsToInputs = {};
  artifactsToActions = {};

  collectionMapping = {};
  inCollection = new Set();
  // Need to map the
  // collectionMap = {};

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

    this.actionsToInputs = {};
    this.artifactsToActions = {};

    // Takes a collection and maps
    // <output-action>:<input-action>:<output-name>: [{key: ,uuid: }, ...]
    this.collectionMapping = {};
    this.inCollection = new Set();

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

  async _inputMap(uuid, action) {
    // Recurse up the prov tree and get mappings of execution id to the inputs
    // that execution took
    // eslint-disable-line no-unused-vars
    if (action === undefined) {
      await this.getProvenanceAction(uuid).then(async (action) => {
        await this._inputMapHelper(uuid, action);
      });
    } else {
      await this._inputMapHelper(uuid, action);
    }
  }

  // TODO: This can recurse through the tree but screw recursively constructing
  // the actual data structures as we return up the call stack. I should put
  // the data structures on the object and just slap things into them as needed
  async _inputMapHelper(uuid, action) {
    this.artifactsToActions[uuid] = action.execution.uuid;

    if (
      action.action.type === "method" ||
      action.action.type === "visualizer" ||
      action.action.type === "pipeline"
    ) {
      if (!(action.execution.uuid in this.actionsToInputs)) {
        this.actionsToInputs[action.execution.uuid] = new Set();
      }

      for (const inputMap of action.action.inputs) {
        const entry = Object.values(inputMap)[0];
        const inputName = Object.keys(inputMap)[0];

        if (typeof entry === "string") {
          await this._getMappings(inputName, entry, action);
        } else if (entry !== null) {
          // TODO: Refactor how this works for collections
          for (const e of entry) {
            if (typeof e !== "string") {
              // If we are here, this was a collection and each e is a
              // key, value pair. This collection could have been an output
              // from another action, and it could be going multiple different
              // places
              const key = Object.keys(e)[0];
              const value = Object.values(e)[0];

              await this._getMappings(`${inputName}-${key}`, value, action);
            } else {
              await this._getMappings(inputName, e, action);
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
            await this._getMappings(paramName, artifactUUID, action);
          }
        }
      }
    }
  }

  async _getMappings(key, uuid, action) {
    this.actionsToInputs[action.execution.uuid].add({ [key]: uuid });

    await this.getProvenanceAction(uuid).then(async (innerAction) => {
      if (!(innerAction.execution.uuid in this.actionsToInputs)) {
        await this._inputMap(uuid, innerAction);
      } else {
        this.artifactsToActions[uuid] = innerAction.execution.uuid;
      }
    });
  }

  async getProvenanceTree() {
    await this._inputMap(this.uuid, undefined);

    const findMaxDepth = (uuid) => {
      if (
        this.artifactsToActions[uuid] === null ||
        typeof this.actionsToInputs[this.artifactsToActions[uuid]] ===
          "undefined" ||
        this.actionsToInputs[this.artifactsToActions[uuid]].size === 0
      ) {
        return 0;
      }
      return (
        1 +
        Math.max(
          ...Array.from(
            this.actionsToInputs[this.artifactsToActions[uuid]],
          ).map((mapping) => findMaxDepth(Object.values(mapping)[0])),
        )
      );
    };

    let height = findMaxDepth(this.uuid);
    let nodes = [];
    let edges = [];
    const actionNodes = [];

    for (const actionUUID of Object.keys(this.actionsToInputs)) {
      for (const mapping of this.actionsToInputs[actionUUID]) {
        let inputName = Object.keys(mapping)[0];

        // The only way we can have a - in the name is if this is a collection
        // element, we sort those out here where we have all the information
        // we need handy in one place. We add the nodes and edges for
        // collections separately from the single artifact nodes and edges
        if (inputName.includes("-")) {
          const splitName = inputName.split("-");

          inputName = splitName[0];
          const inputKey = splitName[1];

          const inputUuid = Object.values(mapping)[0];
          const inputSrc = this.artifactsToActions[inputUuid];

          const collectionID = `${inputSrc}:${actionUUID}:${inputName}`;

          if (!(collectionID in this.collectionMapping)) {
            this.collectionMapping[collectionID] = [
              { key: inputKey, uuid: inputUuid },
            ];
          } else {
            this.collectionMapping[collectionID].push({
              key: inputKey,
              uuid: inputUuid,
            });
          }

          this.inCollection.add(inputUuid);
        } else {
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
    }

    for (const actionUUID of Object.values(this.artifactsToActions)) {
      // These don't need to be sorted.
      if (actionUUID !== null) {
        actionNodes.push({
          data: { id: actionUUID },
        });
      }
    }

    for (const artifactUUID of Object.keys(this.artifactsToActions)) {
      if (!this.inCollection.has(artifactUUID)) {
        nodes.push({
          data: {
            id: artifactUUID,
            parent: this.artifactsToActions[artifactUUID],
            row: findMaxDepth(artifactUUID),
          },
        });
      }
    }

    for (const collectionID of Object.keys(this.collectionMapping)) {
      // Use the uuid of the first artifact in the collection to represent the
      // collection here
      const representative = this.collectionMapping[collectionID][0]["uuid"];

      const split = collectionID.split(":");
      const source = split[0];
      const target = split[1];
      const param = split[2];

      nodes.push({
        data: {
          id: collectionID,
          parent: this.artifactsToActions[representative],
          row: findMaxDepth(representative),
        },
      });

      edges.push({
        data: {
          id: `${param}_${source}to${target}`,
          param: param,
          source: collectionID,
          target: target,
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
