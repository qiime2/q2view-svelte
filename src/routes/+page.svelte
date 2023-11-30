<script lang="ts">
  import Iframe from "$lib/components/Iframe.svelte";
  import Details from "$lib/components/Details.svelte";
  import DropZone from "$lib/components/DropZone.svelte";
  import Provenance from "$lib/components/Provenance.svelte";

  import ViewModel from "$lib/models/viewModel";
  import FileModel from "$lib/models/fileModel";
  import UrlInput from "$lib/components/UrlInput.svelte";
  import Organizer from "$lib/components/Organizer.svelte";

  let viewModel: ViewModel = new ViewModel();
  let fileModel: FileModel = new FileModel();

  let selectedTab: string = "Input";
</script>

<button on:click={() => (selectedTab = "Input")}><img id="navlogo" src="/q2view.png" alt="QIIME 2 view logo"></button>
{#if $viewModel.indexPath}
  <button class="navbutton" on:click={() => (selectedTab = "Visualization")}>Visualization</button>
{/if}
{#if $fileModel.file}
  <button class="navbutton" on:click={() => (selectedTab = "Details")}>Details</button>
  <button class="navbutton" on:click={() => (selectedTab = "Provenance")}>Provenance</button>
{/if}

<Organizer {selectedTab} {viewModel} {fileModel}/>

<style lang="postcss">
  .navbutton {
    @apply bg-slate-300;
  }

  #navlogo {
    @apply h-10
    mt-2;
  }
</style>