<script lang="ts">
  // Global styling
  import "../../app.css";
  import readerModel from "$lib/models/readerModel";

  import Iframe from "$lib/components/Iframe.svelte";
  import Gallery from "$lib/components/Gallery.svelte";
  import Details from "$lib/components/Details.svelte";
  import DropZone from "$lib/components/DropZone.svelte";
  import UrlInput from "$lib/components/UrlInput.svelte";
  import Provenance from "$lib/components/Provenance.svelte";
  import url from "$lib/scripts/url-store";
  import { onMount } from "svelte";
  import About from "$lib/components/About.svelte";
  import { checkBrowserCompatibility } from "$lib/scripts/util";

  let currentSrc = ""
  const uuid4Regex = /[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}/;

  onMount(() => {
    checkBrowserCompatibility();
    readerModel.attachToServiceWorker();
    fetch("/_/wakeup");
  });

  // This block runs every time the URL bar updates. It determines what to do based
  // on the src SearchParam in the URL.
  //
  // Case 1, The src didn't change:
  //  do nothing
  //
  // Case 2, The src changed and is a uuid that is not the currently loaded one:
  //  We throw a fit because this URL is referencing a local source that we do
  //  not have access to.
  //
  // Case 3, The src changed and it is a URL:
  //  We load the new URL.
  //
  // NOTE: Anything that is not a valid uuid4 is presumed to be a URL
  //
  // Case 4, The src changed and it is now empty:
  //  Reset the readerModel because we no longer have data.
  $: {
    const newSrc = $url.searchParams.get("src");
    const newTab = $url.pathname.replaceAll("/", "");

    if (newSrc !== currentSrc) {
      // We have a local source
      if (uuid4Regex.test(newSrc)) {
        // We have a local source that does not match our currently loaded data.
        // This is an error because we do not have access to arbitray local sources
        if (newSrc !== readerModel.uuid) {
          history.replaceState({}, "", "/error/");
          // goto("/error");
        }
        // We have a local source, but it is still the local source we have loaded
      }
      else {
        // We have a non uuid source which is presumed to be a remote source. We
        // attempt to load it.
        //
        // We also provide the tab that was in the URL so after loading the source
        // we can default to this
        if (newSrc) {
          readerModel.readData(newSrc, newTab);
        }
        // We have no source, so we reset
        else {
          readerModel.clear();
        }
      }
    }

    currentSrc = newSrc
  }
</script>

<!-- <div id="navbar"> -->
<nav class="navbar navbar-expand-lg sticky-top bg-light">
  <button class="navbar-brand" on:click={() => (history.pushState({}, "", "/"+window.location.search))}>
    <img id="navlogo" src="/q2view.png" alt="QIIME 2 view logo">
  </button>
  <div class="navbar-text ml-auto mr-auto">
    {$readerModel.name}
  </div>
  <div class="navbar-nav ml-auto">
    {#if $readerModel.indexPath}
      <button class="nav-item" on:click={() => (history.pushState({}, "", "/visualization/"+window.location.search))}>
        Visualization
      </button>
    {/if}
    {#if $readerModel.rawSrc}
      <button class="nav-item" on:click={() => (history.pushState({}, "", "/details/"+window.location.search))}>
        Details
      </button>
      <button class="nav-item" on:click={() => (history.pushState({}, "", "/provenance/"+window.location.search))}>
        Provenance
      </button>
    {/if}
    {#if $readerModel.sourceType === "remote"}
      <div class="dropdown nav-item">
        <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="/link-grey.png" alt="Link" />
        </button>
        <!-- TODO: Should this actually be an anchor? Seems like this link is useless -->
        <div class="dropdown-menu">
          <a href={$url.toString()}>
              Shareable Link:
          </a>
          <input
              readOnly
              value={$url.toString()}
              type="text"
              on:select={e => e.stopPropagation()}
          />
        </div>
      </div>
      <!-- This will only draw if sourceType is remote and if sourceType is remote
          rawSrc is a string, but cast here to stop it from whining -->
      <a class="nav-item" href={String($readerModel.rawSrc)}>
        <img src="/download-grey.png" alt="Download" />
      </a>
    {/if}
  </div>
</nav>
<!-- </div> -->

<div id="container">
  <div class="tab" style:visibility={$url.pathname.replaceAll("/", "") === "" ? "visible" : "hidden"}>
    <p>
        This interface can view .qza and .qzv files
        directly in your browser without uploading to a server.
        <span on:click={() => (history.pushState({}, "", "/about/"+window.location.search))}>Click here to learn more.</span>
    </p>
    <DropZone/>
    <UrlInput/>
    <Gallery/>
  </div>
  <div class="tab" style:visibility={$url.pathname.replaceAll("/", "") === "about" ? "visible" : "hidden"}>
    <About/>
  </div>
  {#if $readerModel.indexPath}
    <div class="tab" style:visibility={$url.pathname.replaceAll("/", "") === "visualization" ? "visible" : "hidden"}>
      <Iframe/>
    </div>
  {/if}
  {#if $readerModel.rawSrc}
    <div class="tab" style:visibility={$url.pathname.replaceAll("/", "") === "details" ? "visible" : "hidden"}>
      <Details/>
    </div>
    <div class="tab" style:visibility={$url.pathname.replaceAll("/", "") === "provenance" ? "visible" : "hidden"}>
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
    grid-column: 1;
    grid-row: 1;
  }
</style>