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
  import { checkBrowserCompatibility, handleError } from "$lib/scripts/util";
  import Error from "$lib/components/Error.svelte";

  import { createCollapsible, melt } from "@melt-ui/svelte";
  import { slide } from "svelte/transition";
  import NavButtons from "$lib/components/NavButtons.svelte";

  let currentSrc = "";
  const uuid4Regex = /[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}/;

  onMount(() => {
    checkBrowserCompatibility();
    readerModel.attachToServiceWorker();
    fetch("/_/wakeup");

    const nav_dropdown = document.getElementById("nav-dropdown") as Element;
    observer.observe(nav_dropdown);
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
  //
  // NOTE: If we were redirected to the error page we skip this.
  $: {
    const newSrc = $url.searchParams.get("src");
    const newTab = $url.pathname.replaceAll("/", "");

    if (newTab !== "error" && newSrc !== currentSrc) {
      // We have a local source
      if (uuid4Regex.test(newSrc)) {
        // We have a local source that does not match our currently loaded data.
        // This is an error because we do not have access to arbitray local sources
        if (newSrc !== readerModel.uuid) {
          handleError(
            "This was a temporary page based on local data. If you " +
              "have access to this data, please reload it. To share " +
              "QIIME 2 Artifacts and Visualizations, please upload your " +
              "file to a file hosting service and provide the resulting " +
              "URL to the home screen of this application.",
            "Expired Data",
          );
        }
        // We have a local source, but it is still the local source we have loaded
      } else {
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

      currentSrc = newSrc;
    }
  }

  const {
    elements: { root, content, trigger },
    states: { open },
  } = createCollapsible({});

  function updateNavDropdownHeight() {
    const nav_dropdown = document.getElementById("nav-dropdown");
    let positioned_container = document.getElementById("positioned-container");

    // This entire function is predicated on this element existing and using
    // its height to offset other elements
    if (nav_dropdown === null) {
      return;
    }

    const nav_dropdown_height = nav_dropdown.clientHeight;
    const offset = 50 + nav_dropdown_height;

    if (positioned_container !== null) {
      positioned_container.style.top = `${offset}px`;
      positioned_container.style.height = `calc(100% - ${offset}px)`;

    }
  }

  const observer = new ResizeObserver(updateNavDropdownHeight);
</script>

<nav id="navbar" use:melt={$root}>
  <div id="nav-container">
    <button
      on:click={() => history.pushState({}, "", "/" + window.location.search)}
    >
      <img id="navlogo" src="/images/q2view.png" alt="QIIME 2 view logo" />
    </button>
    {#if $readerModel.name}
      <div class="nav-section flex hidden lg:block" id="file-text">
        File: {$readerModel.name}
      </div>
    {/if}
    <ul class="nav-section hidden lg:flex">
      <NavButtons {readerModel} />
    </ul>
    <div class="nav-section flex lg:hidden">
      <button use:melt={$trigger} class="btn m-1">
        {#if $open}
          <svg
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block h-6 w-6 stroke-current"
          >
            <title>Close Dropdown</title>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        {:else}
          <svg
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block h-6 w-6 stroke-current"
          >
            <title>Open Dropdown</title>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        {/if}
      </button>
    </div>
  </div>
  <div id="nav-dropdown">
    {#if $open}
      <ul use:melt={$content} transition:slide class="lg:hidden">
        <NavButtons {readerModel} />
      </ul>
    {/if}
  </div>
</nav>

<div id="positioned-container">
  <div id="content-container">
    <div
      class={$url.pathname.replaceAll("/", "") === "" ? "tab" : "hidden-tab"}
    >
      <p>
        This interface can view .qza and .qzv files directly in your browser
        without uploading to a server.
        <span
          on:click={() =>
            history.pushState({}, "", "/about/" + window.location.search)}
          >Click here to learn more.</span
        >
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
  span {
    cursor: pointer;
    color: blue;
    text-decoration: underline;
  }

  #navbar {
    width: 100vw;
    box-shadow: rgb(153, 153, 153) 0px 1px 5px;
    background-color: #f8f8f8;
    @apply fixed
    rounded-none
    z-10
    top-0
    left-0
    right-0;
  }

  #nav-container {
    @apply flex
    mx-auto
    max-w-6xl
    px-10;
  }

  #navlogo {
    width: 125px;
    height: 40px;
    @apply my-1;
  }

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
    max-w-6xl;
  }

  #file-text {
    margin: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-section {
    @apply ml-auto;
  }

  .nav-thumbnail {
    height: 20px;
    width: 20px;
  }

  .tab {
    grid-column: 1;
    grid-row: 1;
    visibility: visible;
    overflow: hidden;
    margin-top: 21px;
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
