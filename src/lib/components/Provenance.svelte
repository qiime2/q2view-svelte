<script lang="ts">
  import JSONTree from "svelte-json-tree";
  import Dag from "./Dag.svelte";
  import type ReaderModel from "$lib/models/readerModel";

  export let readerModel: ReaderModel;
</script>

{#await readerModel.getProvenanceTree()}
  <p>Loading...</p>
{:then data}
  <Dag height={data[0]} elements={data[1]} {readerModel} />
{/await}

<p>{$readerModel.provTitle}</p>
{#if $readerModel.provData !== undefined}
  <JSONTree value={readerModel.provData}/>
{:else}
{/if}