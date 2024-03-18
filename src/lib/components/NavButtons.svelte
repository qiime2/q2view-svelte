<script lang="ts">
  import url from "$lib/scripts/url-store";

  export let readerModel;
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
{/if}

<style lang="postcss">
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
