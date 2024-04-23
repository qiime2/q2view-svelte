<script lang="ts">
  import "../../app.css";

  import readerModel from "$lib/models/readerModel";

  import url from "$lib/scripts/url-store";

  import Iframe from "$lib/components/Iframe.svelte";
  import Gallery from "$lib/components/Gallery.svelte";
  import Details from "$lib/components/Details.svelte";
  import DropZone from "$lib/components/DropZone.svelte";
  import UrlInput from "$lib/components/UrlInput.svelte";
  import Provenance from "$lib/components/Provenance.svelte";
  import About from "$lib/components/About.svelte";
  import Error from "$lib/components/Error.svelte";
</script>

<div id="positioned-container">
  <div id="content-container">
    <div
      class={$url.pathname.replaceAll("/", "") === "" ? "tab" : "hidden-tab"}
    >
      <div id="beta-banner">
        <p>
          We are currently beta testing a new version of q2view. If you would
          like to use the old version <a href="https://old-view.qiime2.org">
          click here</a>.
        </p>
      </div>
      <p class="pb-4">
        This interface can view .qza and .qzv files directly in your browser
        without uploading to a server.
        <a
          href="#"
          on:click={() =>
            history.pushState({}, "", "/about/" + window.location.search)}
          >Click here to learn more.
        </a>
      </p>
      <DropZone />
      <UrlInput />
      <Gallery />
    </div>
    <div
      class={$url.pathname.replaceAll("/", "") === "about"
        ? "tab"
        : "hidden-tab"}
    >
      <About />
    </div>
    <div
      class={$url.pathname.replaceAll("/", "") === "error"
        ? "tab"
        : "hidden-tab"}
    >
      <Error />
    </div>
    {#if $readerModel.indexPath}
      <div
        class={$url.pathname.replaceAll("/", "") === "visualization"
          ? "tab"
          : "hidden-tab"}
      >
        <Iframe />
      </div>
    {/if}
    {#if $readerModel.rawSrc}
      <div
        class={$url.pathname.replaceAll("/", "") === "details"
          ? "tab"
          : "hidden-tab"}
      >
        <Details />
      </div>
      <div
        class={$url.pathname.replaceAll("/", "") === "provenance"
          ? "tab"
          : "hidden-tab"}
      >
        <Provenance />
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  #positioned-container {
    position: absolute;
    top: 50px;
    width: 100%;
    height: calc(100% - 50px);
    overflow: auto;
    /* Prevent content from repositioning in Chromium when a scrollbar appears */
    scrollbar-gutter: stable both-edges;
  }

  #content-container {
    display: grid;
    @apply mx-auto
    px-10
    max-w-7xl;
  }

  #beta-banner {
    @apply text-center
    bg-blue-200
    border
    border-blue-300
    mb-4
    py-4
    rounded-lg;
  }

  .tab {
    margin-top: 21px;
    grid-column: 1;
    grid-row: 1;
    visibility: visible;
    overflow: hidden;
    padding-right: 10px;
    @apply mb-4;
  }

  .hidden-tab {
    grid-column: 1;
    grid-row: 1;
    height: 0;
    visibility: hidden;
    overflow: hidden;
  }
</style>
