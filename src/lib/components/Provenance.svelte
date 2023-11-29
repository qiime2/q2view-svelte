<script lang="ts">
    import JSONTree from "svelte-json-tree";
    import Dag from "./Dag.svelte";
    import type ViewModel from "$lib/models/viewModel";

    export let tab: number;
    export let viewModel: ViewModel;

    let isSelected = false;

    $: if(tab === 3) {
        isSelected = true;
    } else {
        isSelected = false;
    }
</script>

<div class:isSelected class='invisible'>
    {#await viewModel.getProvenanceTree()}
        <p>Loading...</p>
    {:then data}
        <Dag height={data[0]} elements={data[1]} {viewModel} />
    {/await}

    <p>{$viewModel.provTitle}</p>
    {#if $viewModel.provData !== undefined}
        <JSONTree value={viewModel.provData}/>
    {:else}
    {/if}
</div>

<style lang="postcss">
    div.isSelected {
        @apply visible;
    }
</style>