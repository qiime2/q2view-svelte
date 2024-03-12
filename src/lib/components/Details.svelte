<script lang="ts">
  import JSONTree from "svelte-json-tree";

  import Panel from "$lib/components/Panel.svelte";
  import readerModel from "$lib/models/readerModel";
  import ResultDetails from "$lib/components/ResultDetails.svelte";
</script>

<Panel header="Details of {$readerModel.name}">
  <ResultDetails resultJSON={$readerModel.metadata}/>
</Panel>
<p>Citations</p>
<pre id="json">{$readerModel.citations}</pre>

<style lang="postcss">
  #json {
    height:500px;
    width: 1000px;
    overflow: auto;
  }
</style>