<script lang="ts">
    import Dag from "./Dag.svelte";
    import type ViewModel from "$lib/models/viewModel";

    export let viewModel: ViewModel;
</script>

{#await viewModel.getProvenanceTree()}
    <p>Loading...</p>
{:then data}
    <Dag height={data[0]} elements={data[1]} />
{/await}