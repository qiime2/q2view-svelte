<script lang='ts'>
  import readerModel from '$lib/models/readerModel';

  import Iframe from '$lib/components/Iframe.svelte';
  import Gallery from '$lib/components/Gallery.svelte';
  import Details from '$lib/components/Details.svelte';
  import DropZone from '$lib/components/DropZone.svelte';
  import UrlInput from '$lib/components/UrlInput.svelte';
  import Provenance from '$lib/components/Provenance.svelte';

  let selectedTab: string = 'Input';
</script>

<div id='navbar'>
  <button on:click={() => (selectedTab = 'Input')}><img id='navlogo' src='/q2view.png' alt='QIIME 2 view logo'></button>
  {#if $readerModel.indexPath}
    <button class='navbutton' on:click={() => (selectedTab = 'Visualization')}>Visualization</button>
  {/if}
  {#if $readerModel.data}
    <button class='navbutton' on:click={() => (selectedTab = 'Details')}>Details</button>
    <button class='navbutton' on:click={() => (selectedTab = 'Provenance')}>Provenance</button>
  {/if}
</div>


<div id='container'>
  <div class='tab' class:visible={selectedTab === 'Input'}>
    <DropZone/>
    <UrlInput/>
    <Gallery/>
  </div>

  {#if $readerModel.indexPath}
    <div class='tab' class:visible={selectedTab === 'Visualization'}>
      <Iframe indexPath={readerModel.indexPath}/>
    </div>
  {/if}
  {#if $readerModel.data}
    <div class='tab' class:visible={selectedTab === 'Details'}>
      <Details/>
    </div>
    <div class='tab' class:visible={selectedTab === 'Provenance'}>
      <Provenance/>
    </div>
  {/if}
</div>

<style lang='postcss'>
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
    visibility: hidden;
    grid-column: 1;
    grid-row: 1;
  }

  .visible {
    visibility: visible;
  }
</style>