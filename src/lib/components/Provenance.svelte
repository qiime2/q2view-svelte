<script lang="ts">
  import readerModel from "$lib/models/readerModel";

  import JSONTree from "svelte-json-tree";
  import Dag from "./Dag.svelte";
</script>

<Dag/>

<p>{$readerModel.provTitle}</p>
{#if $readerModel.provData !== undefined}
  <JSONTree value={readerModel.provData}/>
{:else}
{/if}