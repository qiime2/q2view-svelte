<script lang="ts">
  import type ReaderModel from "$lib/models/readerModel";

  import Iframe from "$lib/components/Iframe.svelte";
  import Details from "$lib/components/Details.svelte";
  import DropZone from "$lib/components/DropZone.svelte";
  import UrlInput from "$lib/components/UrlInput.svelte";
  import Provenance from "$lib/components/Provenance.svelte";

  export let selectedTab: string;
  export let readerModel: ReaderModel;
</script>

<div id="container">
  <div class="tab" class:visible={selectedTab === "Input"}>
    <DropZone {readerModel}/>
    <UrlInput {readerModel}/>
  </div>

  {#if $readerModel.indexPath}
    <div class="tab" class:visible={selectedTab === "Visualization"}>
      <Iframe indexPath={readerModel.indexPath}/>
    </div>
  {/if}
  {#if $readerModel.data}
    <div class="tab" class:visible={selectedTab === "Details"}>
      <Details {readerModel}/>
    </div>
    <div class="tab" class:visible={selectedTab === "Provenance"}>
      <Provenance {readerModel}/>
    </div>
  {/if}
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