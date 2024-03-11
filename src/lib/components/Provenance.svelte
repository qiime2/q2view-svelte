<script lang="ts">
  import readerModel from "$lib/models/readerModel";

  import JSONTree from "svelte-json-tree";
  import Dag from "./Dag.svelte";
</script>

{#key $readerModel.uuid}
  <Dag/>
{/key}

<p>{$readerModel.provTitle}</p>
{#if $readerModel.provData !== undefined}
  <JSONTree value={readerModel.provData} defaultExpandedLevel={100} shouldShowPreview={false} />
{:else}
{/if}