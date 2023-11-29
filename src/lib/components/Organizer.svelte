<script lang="ts">
    import type ViewModel from "$lib/models/viewModel";
    import type FileModel from "$lib/models/fileModel";

    import Iframe from "$lib/components/Iframe.svelte";
    import Details from "$lib/components/Details.svelte";
    import DropZone from "$lib/components/DropZone.svelte";
    import UrlInput from "$lib/components/UrlInput.svelte";
    import Provenance from "$lib/components/Provenance.svelte";

    export let selectedTab: string;
    export let viewModel: ViewModel;
    export let fileModel: FileModel;

    $: inputVisible = (selectedTab === "Input");
    $: visualizationVisible = (selectedTab === "Visualization");
    $: detailsVisible = (selectedTab === "Details");
    $: provenanceVisible = (selectedTab === "Provenance");
</script>

<div id="container">
    <div id="input" class="tab" class:inputVisible>
        <DropZone {fileModel}/>
        <UrlInput/>
    </div>

    {#await viewModel.initModelFromFile($fileModel)}
        <!-- TODO: We need a real loading bar. At the very least we do not need this -->
        <p>Loading...</p>
    {:then}
        {#if $viewModel.indexPath}
            <div id="visualization" class="tab" class:visualizationVisible>
                <Iframe indexPath={viewModel.indexPath}/>
            </div>
        {/if}
        {#if $fileModel.file}
            <div id="details" class="tab" class:detailsVisible>
                <Details {viewModel}/>
            </div>
            <div id="provenance" class="tab" class:provenanceVisible>
                <Provenance {viewModel}/>
            </div>
        {/if}
    {/await}
</div>

<style lang="postcss">
    #input.inputVisible {
        @apply visible;
    }

    #visualization.visualizationVisible {
        @apply visible;
    }

    #details.detailsVisible {
        @apply visible;
    }

    #provenance.provenanceVisible {
        @apply visible;
    }

    #container {
        display: grid;
    }

    .tab {
        visibility: hidden;
        grid-column: 1;
        grid-row: 1;
    }
</style>