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
      <p>
        This interface can view .qza and .qzv files directly in your browser
        without uploading to a server.
        <a
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
    left: calc(0% - 8px);
    overflow: auto;
    /* Prevent content from repositioning in Chromium when a scrollbar appears */
    scrollbar-gutter: stable both-edges;
  }

  #content-container {
    display: grid;
    @apply mx-auto
    px-10
    max-w-6xl;
  }

  .tab {
    width: calc(100% + 8px);
    margin-top: 21px;
    grid-column: 1;
    grid-row: 1;
    visibility: visible;
    overflow: hidden;
    @apply mb-4
    px-2;
  }

  .hidden-tab {
    grid-column: 1;
    grid-row: 1;
    height: 0;
    visibility: hidden;
    overflow: hidden;
  }
</style>
