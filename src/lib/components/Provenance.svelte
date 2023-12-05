<script lang='ts'>
  import readerModel from '$lib/models/readerModel';

  import JSONTree from 'svelte-json-tree';
  import Dag from './Dag.svelte';
</script>

{#await readerModel.getProvenanceTree()}
  <p>Loading...</p>
{:then data}
  <Dag height={data[0]} elements={data[1]}/>
{/await}

<p>{$readerModel.provTitle}</p>
{#if $readerModel.provData !== undefined}
  <JSONTree value={readerModel.provData}/>
{:else}
{/if}