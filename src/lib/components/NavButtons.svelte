<script lang="ts">
  import { fly } from 'svelte/transition';
  import { createDropdownMenu, melt } from '@melt-ui/svelte';

  import url from "$lib/scripts/url-store";

  export let readerModel;

  let isShareableDropdownOpen = false;

 const handleShareableDropdownClick = () => {
    isShareableDropdownOpen = !isShareableDropdownOpen;
  }

  const {
    elements: { trigger, menu},
    states: { open },
  } = createDropdownMenu({
  });
</script>

{#if $readerModel.indexPath}
  <li>
    <button
        class={$url.pathname.replaceAll("/", "") === "visualization" ? "selected-nav-button nav-button" : "nav-button"}
        on:click={() => (history.pushState({}, "", "/visualization/"+window.location.search))}
    >
      Visualization
    </button>
  </li>
{/if}
{#if $readerModel.rawSrc}
  <li>
    <button
        class={$url.pathname.replaceAll("/", "") === "details" ? "selected-nav-button nav-button" : "nav-button"}
        on:click={() => (history.pushState({}, "", "/details/"+window.location.search))}
    >
      Details
    </button>
  </li>
  <li>
    <button
        class={$url.pathname.replaceAll("/", "") === "provenance" ? "selected-nav-button nav-button" : "nav-button"}
        on:click={() => (history.pushState({}, "", "/provenance/"+window.location.search))}
    >
      Provenance
    </button>
  </li>
  {#if $readerModel.sourceType === "remote"}
    <li>
      <button use:melt={$trigger} class="nav-button" on:click={handleShareableDropdownClick}>
        <img class="nav-thumbnail" src="/images/link-grey.png" alt="Link" />
      </button>
      {#if $open}
        <div use:melt={$menu} transition:fly id="dropdown" style:display={isShareableDropdownOpen ? "block" : "none"}>
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
  {/if}
{/if}

<style lang="postcss">
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

  .nav-button {
    width: 100%;
    @apply p-3
    h-full;
  }

  .nav-button:hover {
    @apply bg-slate-400;
  }

  .selected-nav-button {
    @apply bg-slate-300;
  }
</style>
