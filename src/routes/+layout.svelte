<script lang="ts">
  // Global styling
  import "../app.css";
  import readerModel from "$lib/models/readerModel";

  import Iframe from "$lib/components/Iframe.svelte";
  import Gallery from "$lib/components/Gallery.svelte";
  import Details from "$lib/components/Details.svelte";
  import DropZone from "$lib/components/DropZone.svelte";
  import UrlInput from "$lib/components/UrlInput.svelte";
  import Provenance from "$lib/components/Provenance.svelte";
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";

  onMount(() => {
    let selectedTab = $page.url.pathname.replaceAll("/", "");
    if (selectedTab) {
      readerModel.selectedTab = selectedTab;
    }
    else {
      readerModel.selectedTab = "input";
    }

    readerModel.attachToServiceWorker();
    fetch("/_/wakeup");
    pushState();
  })

  $: {
    $readerModel.selectedTab;
    pushState();
  }

  function pushState() {
    if (!browser) {
      return;
    }

    let newURL = `/${readerModel.selectedTab}`;

    if (readerModel.rawSrc) {
      newURL += `/?src=${readerModel.rawSrc}`;
    }

    console.log(`PUSHING: ${newURL}`);
    history.pushState({}, "", newURL);
    readerModel._dirty();
  }

  $: {
    const newSelectedTab = $page.url.pathname.replaceAll("/", "");
    const newSrc = $page.url.searchParams.get("src");

    if (newSelectedTab) {
      readerModel.selectedTab = newSelectedTab;
      readerModel._dirty();
    }

    if (newSrc && newSrc !== readerModel.rawSrc) {
      readerModel.readData(newSrc);
    }
  }
</script>

<div id="navbar">
  <button on:click={() => {
    readerModel.selectedTab = "input";
    readerModel._dirty();
  }}>
    <img id="navlogo" src="/q2view.png" alt="QIIME 2 view logo">
  </button>
  {#if $readerModel.indexPath}
    <button class="navbutton" on:click={() => {
      readerModel.selectedTab = "visualization";
      readerModel._dirty();
    }}>
      Visualization
    </button>
  {/if}
  {#if $readerModel.data}
    <button class="navbutton" on:click={() => {
      readerModel.selectedTab = "details";
      readerModel._dirty();
    }}>
      Details
    </button>
    <button class="navbutton" on:click={() => {
      readerModel.selectedTab = "provenance";
      readerModel._dirty();
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

  {#if readerModel.indexPath}
    <div class="tab" class:visible={$readerModel.selectedTab === "visualization"}>
      <Iframe/>
    </div>
  {/if}
  {#if readerModel.name && readerModel.metadata && readerModel.citations}
    <div class="tab" class:visible={$readerModel.selectedTab === "details"}>
      <Details/>
    </div>
  {/if}
  {#if readerModel.height && readerModel.elements}
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