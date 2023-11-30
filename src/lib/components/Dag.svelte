<script lang="ts">
  import { onMount } from 'svelte';

  import cytoscape from 'cytoscape';
  import type ViewModel from '$lib/models/viewModel';

  export let height: number;
  export let elements: Array<Object>;
  export let viewModel: ViewModel;

  let self: HTMLDivElement;

  const cytoscapeConfig = {
    boxSelectionEnabled: true,
    autounselectify: false,
    userZoomingEnabled: false,
    layout: {
      name: 'grid',
      fit: false,
      condense: true,
      avoidOverlapPadding: 75,
      position: node => ({
        row: node.data('row'),
        col: node.data('col')
      })
    },
    style: [
      {
        selector: 'node',
        css: {
          'text-valign': 'center',
          'text-halign': 'center'
        }
      },
      {
        selector: '$node > node',
        css: {
          'padding-top': '10px',
          'padding-left': '10px',
          'padding-bottom': '10px',
          'padding-right': '10px',
          'text-valign': 'top',
          'text-halign': 'center',
          'background-color': '#bbb'
        }
      },
      {
        selector: 'edge',
        css: {
          content: 'data(param)',
          'target-arrow-shape': 'triangle',
          'curve-style': 'segments'
        }
      },
      {
        selector: ':selected',
        css: {
          'background-color': 'rgb(81, 132, 151)',
          'line-color': 'rgb(81, 132, 151)',
          'target-arrow-color': 'rgb(81, 132, 151)',
          'source-arrow-color': 'rgb(81, 132, 151)'
        }
      }
    ]
  };

  function setSelection(type, uuid) {
    let selectionData = null;
    if (type === 'action') {
      viewModel.provTitle = 'Action Details';
      selectionData = viewModel.getProvenanceAction(uuid);
    } else {
      viewModel.provTitle = 'Result Details';
      selectionData = viewModel.getProvenanceArtifact(uuid);
    }

    selectionData.then((data) => _setSelection(data))
          .catch(() => _setSelection(undefined));
  };

  function _setSelection(data) {
    viewModel.provData = data;
    viewModel._dirty();
  }

  function clearSelection() {
    viewModel.provTitle = 'Details';
    viewModel.provData = undefined;
    viewModel._dirty();
  }

  onMount(() =>{
    let displayHeight = (height + 1) * 105;
    self.style.setProperty('height', `${displayHeight}px`);
    let lock = false; // used to prevent recursive event storms
    let selectedExists = false;
    let cy = cytoscape({
      ...cytoscapeConfig,
      container: document.getElementById('cy'),
      elements: elements
    });

    cy.on('select', 'node, edge', (event) => {
      if (!lock) {
        selectedExists = true;
        lock = true;
        const elem = event.target;

        let node = elem;
        if (elem.isEdge()) {
          node = elem.source();
        }

        // This is getting the information to draw the details of the
        // selected node clicked on. I don't really know how it works
        // lol
        if (node.isParent()) {
          setSelection('action', node.children()[0].data('id'));
        } else {
          setSelection('artifact', node.data('id'));
        }

        const edges = node.edgesTo('node');
        cy.elements('node, edge').unselect();
        node.select();
        edges.select();

        lock = false;
      }
    });

    cy.on('unselect', 'node, edge', (event) => {  // eslint-disable-line no-unused-vars
      cy.elements('node, edge').unselect();
      if (!lock && selectedExists) {
        clearSelection();
        selectedExists = false;
      }
    });

    cy.center();
  });
</script>

<div
  bind:this={self}
  id='cy'
/>