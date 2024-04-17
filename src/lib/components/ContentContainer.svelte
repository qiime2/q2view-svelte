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

  $: console.log($url.pathname.replaceAll("/", ""));
</script>

<div id="positioned-container">
  <div id="content-container">
    <div
      class={$url.pathname.replaceAll("/", "") === "" ? "tab" : "hidden-tab"}
    >
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
          ? "prov-tab"
          : "hidden-tab"}
      >
        <Provenance />
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  #positioned-container {
    top: 50px;
    height: calc(100% - 50px);
    @apply absolute
    overflow-auto
    w-full;
  }

  #content-container {
    display: grid;
    @apply w-full;
  }

  .tab {
    overflow: hidden;
    grid-column: 1;
    grid-row: 1;
    margin-top: 21px;
    @apply  max-w-7xl
    mx-auto
    mb-4;
  }

  .prov-tab {
    overflow: hidden;
    grid-column: 1;
    grid-row: 1;
    margin-top: 21px;
    @apply w-full
    mb-4
    px-4;
  }

  .hidden-tab {
    visibility: hidden;
    overflow: hidden;
    grid-column: 1;
    grid-row: 1;
    height: 0;
    @apply mx-auto;
  }
</style>
