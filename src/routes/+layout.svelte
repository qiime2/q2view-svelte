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
  import url from "$lib/scripts/url-store";
  import { onMount } from "svelte";

  let currentSrc = ""

  onMount(() => {
    readerModel.attachToServiceWorker();
    fetch("/_/wakeup");
  });

  $: {
    const newSrc = $url.searchParams.get("src")

    if (newSrc !== currentSrc) {
      if (newSrc) {
        readerModel.readData(newSrc);
      }
      else {
        readerModel.clear();
      }
      currentSrc = newSrc
    }
  }
</script>

<div id="navbar">
  <button on:click={() => (history.pushState({}, "", "/"+window.location.search))}>
    <img id="navlogo" src="/q2view.png" alt="QIIME 2 view logo">
  </button>
  {#if $readerModel.indexPath}
    <button on:click={() => (history.pushState({}, "", "/visualization/"+window.location.search))}>
      Visualization
    </button>
  {/if}
  {#if $readerModel.data}
    <button on:click={() => (history.pushState({}, "", "/details/"+window.location.search))}>
      Details
    </button>
    <button on:click={() => (history.pushState({}, "", "/provenance/"+window.location.search))}>
      Provenance
    </button>
  {/if}
</div>

<div id="container">
  <div class="tab" class:visible={$url.pathname.replaceAll("/", "") === ""}>
    <DropZone/>
    <UrlInput/>
    <Gallery/>
  </div>

  {#if $readerModel.indexPath}
    <div class="tab" class:visible={$url.pathname.replaceAll("/", "")  === "visualization"}>
      <Iframe/>
    </div>
  {/if}
  {#if $readerModel.data}
    <div class="tab" class:visible={$url.pathname.replaceAll("/", "") === "details"}>
      <Details/>
    </div>
    <div class="tab" class:visible={$url.pathname.replaceAll("/", "")  === "provenance"}>
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