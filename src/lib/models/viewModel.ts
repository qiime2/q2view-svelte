import yaml from 'js-yaml';
import JSZip from "jszip";

import { readBlobAsText } from "$lib/scripts/util";
import extmap from "$lib/scripts/extmap";
import schema from '$lib/scripts/yaml-schema';

export default class ViewModel {
  uuid: string = "";
  indexPath: string = "";
  version: string = "";
  frameworkVersion: string = "";
  zipReader: JSZip | null = null;
  port: string | null = null;
  name: string = "";

  citations: string | null | undefined = undefined;
  metadata: string | object | undefined = undefined;

  session: string;

  height: number | undefined = undefined;
  elements: Array<Object> | undefined = undefined;

  provData: Object | undefined = undefined;
  provTitle: String = "Details";

  _subscription: Record<number, (arg0: ViewModel) => void> = {};
  _subscriptionNum = 0;

  constructor() {
    this.session = Math.random().toString(36).substr(2);
  }

  _dirty() {
      for (const subscription of Object.values(this._subscription)) {
          subscription(this);
      }
  }

  subscribe(subscription: (value: ViewModel) => void): () => void {
      this._subscription[this._subscriptionNum] = subscription;
      subscription(this);
      return ((index) => {
          return () => {
              delete this._subscription[index];
          };
      })(this._subscriptionNum++);
  }

  initModelFromFile(fileModel) {
    let file = fileModel.file;
    if (file === null) {
      return;
    }

    this.name = file.name;

    // TODO: This needs to go in an actual place lol
    this.attachToServiceWorker();
    fetch('/_/wakeup');

    const jsZip = new JSZip();
    return jsZip.loadAsync(file).then((zip) => {
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
      if (
        uniquePaths.find((path) => path === `${UUID}/VERSION`) === undefined
      ) {
        throw error;
      }

      this.uuid = UUID;
      this.indexPath = `/_/${this.session}/${UUID}/data/index.html`;
      this.zipReader = zip;
    });
  }

  initModelFromURL(url) {
    // eslint-disable-line no-unused-vars
    // TODO, be smurter and make this someday
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
    });
  }

  attachToServiceWorker() {
    window.navigator.serviceWorker.onmessage = (event) => {
      if (event.data.session !== this.session) {
        return; // This message is meant for another tab.
      }
      switch (event.data.type) {
        case "GET_DATA":
          // decode should go in the SW, but that'd require an upgrade
          this._getFile(decodeURI(event.data.filename))
            .then((data) => {
              // the request should provide a port for later response
              event.ports[0].postMessage(data);
            })
            .catch((error) => console.error(error)); // eslint-disable-line no-console
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
          .then(data => new Blob([data.byteArray], { type: data.type }))
          .then(readBlobAsText)
          .then(text => yaml.safeLoad(text, { schema }));
  }

  getCitations() {
    if (this.citations !== undefined) {
      return this.citations;
    }

    return this._getCitations().then((citations) => {
      this.citations = this.dedup(citations);
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

  dedup(bibtex) {
      const store = {};
      const dedup = [];

      let skip = false;
      for (const line of bibtex.split('\n')) {
          if (line.startsWith('@')) {
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
      return dedup.join('\n');
  }

  getURLOfPath(relpath) {
    return `/_/${this.session}/${this.uuid}/${relpath}`;
  }

  getMetadata() {
    if (this.metadata !== undefined) {
      return this.metadata;
    }

    return this._getYAML('metadata.yaml').then((metadata) => {
      this.metadata = metadata;
      return metadata;
    });
  }

  _artifactMap(uuid) {
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      this.getProvenanceAction(uuid)
        .then((action) => {
          const artifactsToAction = {};
          artifactsToAction[uuid] = action.execution.uuid;
          if (
            action.action.type === "method" ||
            action.action.type === "visualizer" ||
            action.action.type === "pipeline"
          ) {
            const promises = [];
            for (const inputMap of action.action.inputs) {
              const entry = Object.values(inputMap)[0];
              if (typeof entry === "string") {
                promises.push(this._artifactMap(entry));
              } else if (entry !== null) {
                for (const e of entry) {
                  promises.push(this._artifactMap(e));
                }
              } // else optional artifact
            }
            for (const paramMap of action.action.parameters) {
              const param = Object.values(paramMap)[0];
              if (
                param !== null &&
                typeof param === "object" &&
                Object.prototype.hasOwnProperty.call(param, "artifacts")
              ) {
                for (const artifactUUID of param.artifacts) {
                  promises.push(this._artifactMap(artifactUUID));
                }
              }
            }
            if (promises.length !== 0) {
              Promise.all(promises)
                .then((aList) => Object.assign(artifactsToAction, ...aList))
                .then(resolve);
            } else {
              resolve(artifactsToAction); // no artifacts involved
            }
          } else {
            resolve(artifactsToAction);
          }
        })
        .catch(() => resolve({ [uuid]: null }));
    });
  }

  _inputMap(uuid) {
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      this.getProvenanceAction(uuid)
        .then((action) => {
          const inputs = {};
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
                promises.push(this._inputMap(entry));
              } else if (entry !== null) {
                for (const e of entry) {
                  inputs[action.execution.uuid].add({ [inputName]: e });
                  promises.push(this._inputMap(e));
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
                  promises.push(this._inputMap(artifactUUID));
                }
              }
            }
            if (promises.length !== 0) {
              Promise.all(promises)
                .then((iList) => Object.assign(inputs, ...iList))
                .then(resolve);
            } else {
              resolve({}); // no artifacts involved
            }
          } else {
            resolve({});
          }
        })
        .catch(() => resolve({}));
    });
  }

  getProvenanceTree() {
    if (this.height !== undefined && this.elements.length !== undefined){
      return [this.height, this.elements]
    }

    return Promise.all([
      this._artifactMap(this.uuid),
      this._inputMap(this.uuid),
    ]).then(([artifacts, actions]) => {
      const findMaxDepth = (uuid) => {
        if (artifacts[uuid] === null || typeof actions[artifacts[uuid]] === 'undefined') {
            return 0;
        }
        return 1 + Math.max(...Array.from(actions[artifacts[uuid]]).map(mapping =>
            findMaxDepth(Object.values(mapping)[0])));
      };

      let height = findMaxDepth(this.uuid);
      let nodes = [];
      let edges = [];
      const actionNodes = [];

      for (const actionUUID of Object.keys(actions)) {
          for (const mapping of actions[actionUUID]) {
              edges.push({
                  data: {
                      id: `${Object.keys(mapping)[0]}_${Object.values(mapping)[0]}to${actionUUID}`,
                      param: Object.keys(mapping)[0],
                      source: Object.values(mapping)[0],
                      target: actionUUID
                  }
              });
          }
      }

      for (const actionUUID of Object.values(artifacts)) {
          // These don't need to be sorted.
          if (actionUUID !== null) {
              actionNodes.push({
                  data: { id: actionUUID }
              });
          }
      }

      for (const artifactUUID of Object.keys(artifacts)) {
          nodes.push({
              data: {
                  id: artifactUUID,
                  parent: artifacts[artifactUUID],
                  row: findMaxDepth(artifactUUID)
              }
          });
      }

      for (let i = 0; i < height; i += 1) {
          const currNodes = nodes.filter(v => v.data.row === i);
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

      this.height = height;
      this.elements = elements;

      return [height, elements];
    });
  }

  getProvenanceAction(uuid) {
      if (this.uuid === uuid) {
          return this._getYAML('provenance/action/action.yaml');
      }
      return this._getYAML(`provenance/artifacts/${uuid}/action/action.yaml`);
  }

  getProvenanceArtifact(uuid) {
      if (this.uuid === uuid) {
          return this._getYAML('provenance/metadata.yaml');
      }
      return this._getYAML(`provenance/artifacts/${uuid}/metadata.yaml`);
  }
}
