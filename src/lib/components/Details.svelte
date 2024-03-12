<script lang="ts">
  import JSONTree from "svelte-json-tree";

  import Panel from "$lib/components/Panel.svelte";
  import readerModel from "$lib/models/readerModel";
  import ResultDetails from "$lib/components/ResultDetails.svelte";
</script>

<Panel header="Details of {$readerModel.name}">
  <ResultDetails name={$readerModel.name} resultJSON={$readerModel.metadata}/>
</Panel>
<Panel header="Citations">
  <pre id="json">{$readerModel.citations}</pre>
</Panel>

<style lang="postcss">
  #json {
    @apply border
    border-black
    bg-gray-100
    overflow-x-auto
    p-2
    m-2
    text-xs;
  }
</style>