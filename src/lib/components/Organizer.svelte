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
</script>

<div id="container">
    <div class="tab" class:visible={selectedTab === "Input"}>
        <DropZone {fileModel}/>
        <UrlInput/>
    </div>

    {#await viewModel.initModelFromFile($fileModel)}
        <!-- TODO: We need a real loading bar. At the very least we do not need this -->
        <p>Loading...</p>
    {:then}
        {#if $viewModel.indexPath}
            <div class="tab" class:visible={selectedTab === "Visualization"}>
                <Iframe indexPath={viewModel.indexPath}/>
            </div>
        {/if}
        {#if $fileModel.file}
            <div class="tab" class:visible={selectedTab === "Details"}>
                <Details {viewModel}/>
            </div>
            <div class="tab" class:visible={selectedTab === "Provenance"}>
                <Provenance {viewModel}/>
            </div>
        {/if}
    {/await}
</div>

<style lang="postcss">
    #container {
        display: grid;
    }

    .tab {
        visibility: hidden;
        grid-column: 1;
        grid-row: 1;
    }

    .visible {
        visibility: visible;
    }
</style>