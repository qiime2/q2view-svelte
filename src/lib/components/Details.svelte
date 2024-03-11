<script lang="ts">
  import JSONTree from "svelte-json-tree";

  import readerModel from "$lib/models/readerModel";
  import ResultDetails from "$lib/components/ResultDetails.svelte";
</script>

<p>Details</p>
<p>{$readerModel.name}</p>
<ResultDetails resultJSON={$readerModel.metadata}/>
<JSONTree value={$readerModel.metadata} defaultExpandedLevel={100}/>
<p>Citations</p>
<pre id="json">{$readerModel.citations}</pre>

<style lang="postcss">
  #json {
    height:500px;
    width: 1000px;
    overflow: auto;
  }
</style>