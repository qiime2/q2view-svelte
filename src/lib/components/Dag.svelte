<script lang="ts">
    import { onMount } from 'svelte';

    import cytoscape from 'cytoscape';

    export let height: number;
    export let elements: Array<Object>;

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
                const elem = event.cyTarget;

                let node = elem;
                if (elem.isEdge()) {
                    node = elem.source();
                }

                // if (node.isParent()) {
                //     props.setSelection({
                //         type: 'action',
                //         uuid: node.children()[0].data('id')
                //     });
                // } else {
                //     props.setSelection({
                //         type: 'artifact',
                //         uuid: node.data('id')
                //     });
                // }

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