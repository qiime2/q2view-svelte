<script lang="ts">
  import "../../app.css";

  import { onMount } from "svelte";

  import readerModel from "$lib/models/readerModel";
  import cytoscape from "cytoscape";

  let self: HTMLDivElement;

  const cytoscapeConfig = {
    boxSelectionEnabled: true,
    autounselectify: false,
    userZoomingEnabled: false,
    layout: {
      name: "grid",
      fit: false,
      condense: true,
      avoidOverlapPadding: 75,
      position: node => ({
        row: node.data("row"),
        col: node.data("col")
      })
    },
    style: [
      {
        selector: "node",
        css: {
          "text-valign": "center",
          "text-halign": "center"
        }
      },
      {
        selector: "$node > node",
        css: {
          "padding-top": "10px",
          "padding-left": "10px",
          "padding-bottom": "10px",
          "padding-right": "10px",
          "text-valign": "top",
          "text-halign": "center",
          "background-color": "#bbb"
        }
      },
      {
        selector: "edge",
        css: {
          content: "data(param)",
          "target-arrow-shape": "triangle",
          "curve-style": "segments"
        }
      },
      {
        selector: ":selected",
        css: {
          "background-color": "rgb(29, 78, 216)",
          "line-color": "rgb(29, 78, 216)",
          "target-arrow-color": "rgb(29, 78, 216)",
          "source-arrow-color": "rgb(29, 78, 216)"
        }
      }
    ]
  };

  function setSelection(type, uuid) {
    let selectionData = null;
    if (type === "action") {
      readerModel.provTitle = "Action Details";
      selectionData = readerModel.getProvenanceAction(uuid);
    } else {
      readerModel.provTitle = "Result Details";
      selectionData = readerModel.getProvenanceArtifact(uuid);
    }

    selectionData.then((data) => _setSelection(data))
          .catch(() => _setSelection(undefined));
  };

  function _setSelection(data) {
    readerModel.provData = data;
    readerModel._dirty();
  }

  // TODO: The way this works causes the $readerModel.provData to flicker undefined
  // briefly when clicking between nodes which looks bad. Additionally, something
  // is causing the dag and info columns to jitter around in Chrome
  function clearSelection() {
    readerModel.provTitle = "Details";
    readerModel.provData = undefined;
    readerModel._dirty();
  }

  onMount(() => {
    // Set this height so we center the DAG based on this height
    let displayHeight = (readerModel.height + 1) * 105;
    self.style.setProperty("height", `${displayHeight}px`);

    let lock = false; // used to prevent recursive event storms
    let selectedExists = false;
    let cy = cytoscape({
      ...cytoscapeConfig,
      container: document.getElementById("cy"),
      elements: readerModel.elements
    });

    cy.on("select", "node, edge", (event) => {
      if (!lock) {
        selectedExists = true;
        lock = true;
        const elem = event.target;

        let node = elem;
        if (elem.isEdge()) {
          node = elem.source();
        }

        // This is getting the information to draw the details of the
        // selected node clicked on. I don"t really know how it works
        // lol
        if (node.isParent()) {
          setSelection("action", node.children()[0].data("id"));
        } else {
          setSelection("artifact", node.data("id"));
        }

        const edges = node.edgesTo("node");
        cy.elements("node, edge").unselect();
        node.select();
        edges.select();

        lock = false;
      }
    });

    cy.on("unselect", "node, edge", (event) => {  // eslint-disable-line no-unused-vars
      cy.elements("node, edge").unselect();
      if (!lock && selectedExists) {
        clearSelection();
        selectedExists = false;
      }
    });

    // Now center the DAG in the small canvas
    cy.center();

    // Now expand the canvas post facto to give them space to move things around
    self.style.setProperty("height", `calc(2 * ${displayHeight}px)`);
  });
</script>

<div
  bind:this={self}
  id="cy"
/>

<style lang="postcss">
  #cy {
    @apply mx-2
    border
    border-gray-300
  }
</style>
