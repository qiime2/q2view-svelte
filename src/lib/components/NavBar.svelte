<script lang="ts">
  import "../../app.css";

  import readerModel from "$lib/models/readerModel";

  import { onMount } from "svelte";
  import url from "$lib/scripts/url-store";

  import NavButtons from "$lib/components/NavButtons.svelte";

  import { createCollapsible, createDropdownMenu, melt } from "@melt-ui/svelte";
  import { slide, fly } from "svelte/transition";

  onMount(() => {
    const nav_dropdown = document.getElementById("nav-dropdown") as Element;
    observer.observe(nav_dropdown);
  });

  const observer = new ResizeObserver(updateNavDropdownHeight);

  const {
    elements: { root, content, trigger: triggerCollapsible },
    states: { open: openCollapsible },
  } = createCollapsible({});

  const {
    elements: { menu, trigger: triggerDropdown },
    states: { open: openDropdown },
  } = createDropdownMenu({});

  function updateNavDropdownHeight() {
    const nav_dropdown = document.getElementById("nav-dropdown");
    const positioned_container = document.getElementById("positioned-container");

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
    {#if $readerModel.indexPath || $readerModel.rawSrc}
      <div class="nav-section flex lg:hidden">
        <button use:melt={$triggerCollapsible} class="btn p-3">
          {#if $openCollapsible}
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
    {/if}
    {#if $readerModel.sourceType === "remote"}
      <ul class="flex">
        <li>
          <button use:melt={$triggerDropdown} class="nav-button">
            <img class="nav-thumbnail" src="/images/link-grey.png" alt="Link" />
          </button>
          {#if $openDropdown}
            <div use:melt={$menu} transition:fly id="dropdown">
              <a href={$url.toString()}>
                  Shareable Link:
              </a>
              <input
                  id="dropdown-input"
                  readOnly
                  value={$url.toString()}
                  type="text"
                  on:select={e => e.stopPropagation()}
              />
            </div>
          {/if}
        </li>
        <li>
          <button class="nav-button" onclick="location.href='{String($readerModel.rawSrc)}'" type="button">
            <img class="nav-thumbnail" src="/images/download-grey.png" alt="Download" />
          </button>
        </li>
      </ul>
    {/if}
  </div>
  <div id="nav-dropdown">
    {#if $openCollapsible}
      <ul use:melt={$content} transition:slide class="lg:hidden">
        <NavButtons {readerModel} />
      </ul>
    {/if}
  </div>
</nav>

<style lang="postcss">
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

  #dropdown {
    box-shadow: rgb(153, 153, 153) 0px 1px 5px;
    @apply absolute
    border
    border-black
    rounded
    h-auto
    p-1
    bg-gray-100
    z-10;
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

  .nav-thumbnail {
    height: 20px;
    width: 20px;
  }

  :global(.nav-button) {
    width: 100%;
    @apply p-3
    h-full;
  }

  :global(.nav-button:hover) {
    @apply bg-gray-300;
  }

  :global(.selected-nav-button) {
    @apply bg-gray-200;
  }
</style>