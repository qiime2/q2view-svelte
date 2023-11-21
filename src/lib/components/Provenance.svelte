<script lang="ts">
    import type ViewModel from "$lib/models/viewModel";

    export let viewModel: ViewModel;

    let height;
    let nodes;
    let edges;

    function getProvenanceTree() {
        viewModel.getProvenanceTree().then(([artifacts, actions]) => {
            const findMaxDepth = (uuid) => {
                if (artifacts[uuid] === null || typeof actions[artifacts[uuid]] === 'undefined') {
                    return 0;
                }
                return 1 + Math.max(...Array.from(actions[artifacts[uuid]]).map(mapping =>
                    findMaxDepth(Object.values(mapping)[0])));
            };


            height = findMaxDepth(viewModel.uuid);
            nodes = [];
            edges = [];
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
        });
    }
</script>

{#await getProvenanceTree()}
    <p>Loading...</p>
{:then}
    <p>Provenance {height} {nodes} {edges}</p>
{/await}