<script lang="ts">
  import Panel from "$lib/components/Panel.svelte";
  import readerModel from "$lib/models/readerModel";
  import { getScrollBarWidth } from "$lib/scripts/util";

  import JSONTree from "svelte-json-tree";
  import Dag from "./Dag.svelte";
</script>

<div id="provenance">
  {#key $readerModel.uuid}
    <Dag />
  {/key}
  <Panel header={$readerModel.provTitle}>
    {#if $readerModel.provData !== undefined}
      <div class="JSONTree">
        <JSONTree
          value={readerModel.provData}
          defaultExpandedLevel={100}
          shouldShowPreview={false}
        />
      </div>
    {:else}
      <p>Click on an element of the Provenance Graph to learn more</p>
    {/if}
  </Panel>
</div>

<style lang="postcss">
  #provenance {
    @apply grid
    md:grid-cols-1
    lg:grid-cols-[70%_30%]
    gap-2;
  }
</style>
