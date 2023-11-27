<script lang="ts">
    import JSONTree from "svelte-json-tree";
    import type ViewModel from "$lib/models/viewModel";

    export let viewModel: ViewModel;
</script>

<p>Details</p>
{#await viewModel.getMetadata()}
    <p>Loading metadata...</p>
{:then}
    <p>{viewModel.name}</p>
    <JSONTree value={viewModel.metadata}/>
{/await}
<p>Citations</p>
{#await viewModel.getCitations()}
    <p>Loading citations...</p>
{:then}
    <pre>{viewModel.citations}</pre>
{/await}