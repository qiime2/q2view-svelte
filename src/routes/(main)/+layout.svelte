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
  import NavHamburger from "$lib/components/NavHamburger.svelte";

  let isNavMenuDropdownOpen = false;
  let isShareableDropdownOpen = false;
  let currentSrc = "";
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
          handleError("This was a temporary page based on local data. If you " +
                      "have access to this data, please reload it. To share " +
                      "QIIME 2 Artifacts and Visualizations, please upload your " +
                      "file to a file hosting service and provide the resulting " +
                      "URL to the home screen of this application.",
                      "Expired Data");
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

  const handleNavMenuDropdownClick = () => {
    isNavMenuDropdownOpen = !isNavMenuDropdownOpen;
  }

  const handleShareableDropdownClick = () => {
    isShareableDropdownOpen = !isShareableDropdownOpen;
  }
</script>

<nav id="navbar">
  <div id="nav-container">
    <button on:click={() => (history.pushState({}, "", "/"+window.location.search))}>
      <img id="navlogo" src="/images/q2view.png" alt="QIIME 2 view logo">
    </button>
    {#if $readerModel.name}
      <div class="nav-section flex hidden lg:block" id="file-text">
        File: {$readerModel.name}
      </div>
    {/if}
    <ul class="nav-section hidden lg:flex">
      {#if $readerModel.indexPath}
        <li>
          <button
              class={$url.pathname.replaceAll("/", "") === "visualization" ? "selected-button nav-button" : "nav-button"}
              on:click={() => (history.pushState({}, "", "/visualization/"+window.location.search))}
          >
            Visualization
          </button>
        </li>
      {/if}
      {#if $readerModel.rawSrc}
        <li>
          <button
              class={$url.pathname.replaceAll("/", "") === "details" ? "selected-button nav-button" : "nav-button"}
              on:click={() => (history.pushState({}, "", "/details/"+window.location.search))}
          >
            Details
          </button>
        </li>
        <li>
          <button
              class={$url.pathname.replaceAll("/", "") === "provenance" ? "selected-button nav-button" : "nav-button"}
              on:click={() => (history.pushState({}, "", "/provenance/"+window.location.search))}
          >
            Provenance
          </button>
        </li>
      {/if}
      {#if $readerModel.sourceType === "remote"}
        <li>
          <button class="nav-button" on:click={handleShareableDropdownClick}>
            <img class="nav-thumbnail" src="/images/link-grey.png" alt="Link" />
          </button>
          <div id="dropdown" style:display={isShareableDropdownOpen ? "block" : "none"}>
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
        </li>
        <li>
          <button class="nav-button" onclick="location.href='{String($readerModel.rawSrc)}'" type="button">
            <img class="nav-thumbnail" src="/images/download-grey.png" alt="Download" />
          </button>
        </li>
      {/if}
    </ul>
    <div class="nav-section flex lg:hidden">
      <button class="btn m-1" on:click={handleNavMenuDropdownClick}>
        {#if isNavMenuDropdownOpen}
          <svg
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block h-6 w-6 stroke-current">
            <title>Close Dropdown</title>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <svg
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block h-6 w-6 stroke-current">
            <title>Open Dropdown</title>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>
    </div>
  </div>
  <ul id="nav-dropdown" style:display={isNavMenuDropdownOpen ? 'block' : 'none'}>
    {#if $readerModel.indexPath}
      <li>
        <button
            class={$url.pathname.replaceAll("/", "") === "visualization" ? "selected-button nav-button" : "nav-button"}
            on:click={() => (history.pushState({}, "", "/visualization/"+window.location.search))}
            style="width: 100vw"
        >
          Visualization
        </button>
      </li>
    {/if}
    {#if $readerModel.rawSrc}
      <li>
        <button
            class={$url.pathname.replaceAll("/", "") === "details" ? "selected-button nav-button" : "nav-button"}
            on:click={() => (history.pushState({}, "", "/details/"+window.location.search))}
            style="width: 100vw"
        >
          Details
        </button>
      </li>
      <li>
        <button
            class={$url.pathname.replaceAll("/", "") === "provenance" ? "selected-button nav-button" : "nav-button"}
            on:click={() => (history.pushState({}, "", "/provenance/"+window.location.search))}
            style="width: 100vw"
        >
          Provenance
        </button>
      </li>
    {/if}
  </ul>
</nav>

<div id="content-container">
  <div class={$url.pathname.replaceAll("/", "") === "" ? "tab" : "hidden-tab"}>
    <p>
        This interface can view .qza and .qzv files
        directly in your browser without uploading to a server.
        <span on:click={() => (history.pushState({}, "", "/about/"+window.location.search))}>Click here to learn more.</span>
    </p>
    <DropZone/>
    <UrlInput/>
    <Gallery/>
  </div>
  <div class={$url.pathname.replaceAll("/", "") === "about" ? "tab" : "hidden-tab"}>
    <About/>
  </div>
  <div class={$url.pathname.replaceAll("/", "") === "error" ? "tab" : "hidden-tab"}>
    <Error/>
  </div>
  {#if $readerModel.indexPath}
    <div class={$url.pathname.replaceAll("/", "") === "visualization" ? "tab" : "hidden-tab"}>
      <Iframe/>
    </div>
  {/if}
  {#if $readerModel.rawSrc}
    <div class={$url.pathname.replaceAll("/", "") === "details" ? "tab" : "hidden-tab"}>
      <Details/>
    </div>
    <div class={$url.pathname.replaceAll("/", "") === "provenance" ? "tab" : "hidden-tab"}>
      <Provenance/>
    </div>
  {/if}
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
    margin-bottom: 21px;
    @apply fixed
    rounded-none
    z-10
    top-0
    left-0
    right-0;
  }

  #nav-container {
    /* max-width: 66vw; */
    @apply flex
    m-auto
    max-w-6xl
    px-10;
  }

  #navlogo {
    width: 125px;
    height: 40px;
    @apply my-1;
  }

  #content-container {
    display: grid;
    margin-top: 65px;
    /* max-width: 66vw; */
    @apply mx-auto
    max-w-6xl
    px-10;
  }

  #dropdown {
    box-shadow: rgb(153, 153, 153) 0px 1px 5px;
    @apply absolute
    border
    border-black
    rounded
    h-auto
    p-1
    bg-gray-100;
  }

  #dropdown-input {
    @apply border
    border-black
    rounded
    w-full
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

  .nav-button {
    @apply p-3
    h-full;
  }

  .nav-button:hover {
    @apply bg-slate-400;
  }

  .nav-thumbnail {
    height: 20px;
    width: 20px;
  }

  .selected-button {
    @apply bg-slate-300;
  }

  .tab {
    grid-column: 1;
    grid-row: 1;
    visibility: visible;
    overflow: hidden;
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