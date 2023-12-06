<script lang="ts">
  import readerModel from "$lib/models/readerModel";

  import Iframe from "$lib/components/Iframe.svelte";
  import Gallery from "$lib/components/Gallery.svelte";
  import Details from "$lib/components/Details.svelte";
  import DropZone from "$lib/components/DropZone.svelte";
  import UrlInput from "$lib/components/UrlInput.svelte";
  import Provenance from "$lib/components/Provenance.svelte";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  // This needs to be exported because it needs to be set by external things
  // initing this state to the tab we want
  onMount(() => {
    readerModel.attachToServiceWorker();
    fetch("/_/wakeup");
    pushState();
  })

  function pushState() {
    if (!browser) {
      return;
    }

    console.log(readerModel.selectedTab);
    history.pushState({}, "", "/");

    let newURl = readerModel.selectedTab;

    if (readerModel.rawSrc) {
      newURl += `/?src=${readerModel.rawSrc}`;
    }

    history.pushState({}, "", newURl);
    readerModel._dirty();
  }
</script>

<div id="navbar">
  <button on:click={() => {
    readerModel.selectedTab = "input";
    pushState()
  }}>
    <img id="navlogo" src="/q2view.png" alt="QIIME 2 view logo">
  </button>
  {#if $readerModel.indexPath}
    <button class="navbutton" on:click={() => {
      readerModel.selectedTab = "visualization";
      pushState();
    }}>
      Visualization
    </button>
  {/if}
  {#if $readerModel.data}
    <button class="navbutton" on:click={() => {
      readerModel.selectedTab = "details";
      pushState();
    }}>
      Details
    </button>
    <button class="navbutton" on:click={() => {
      readerModel.selectedTab = "provenance";
      pushState();
    }}>
      Provenance
    </button>
  {/if}
</div>

<div id="container">
  <div class="tab" class:visible={$readerModel.selectedTab === "input"}>
    <DropZone/>
    <UrlInput/>
    <Gallery/>
  </div>

  {#if $readerModel.indexPath}
    <div class="tab" class:visible={$readerModel.selectedTab === "visualization"}>
      <Iframe indexPath={$readerModel.indexPath}/>
    </div>
  {/if}
  {#if $readerModel.data}
    <div class="tab" class:visible={$readerModel.selectedTab === "details"}>
      <Details/>
    </div>
    <div class="tab" class:visible={$readerModel.selectedTab === "provenance"}>
      <Provenance/>
    </div>
  {/if}
</div>

<style lang="postcss">
  #navbar {
    @apply fixed
    rounded-none
    shadow
    z-10
    top-0
    left-0
    right-0
    bg-slate-300;
  }

  #navlogo {
    @apply h-10
    mt-2;
  }

  #container {
    display: grid;
    margin-top: 75px;
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