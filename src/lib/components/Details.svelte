<script lang="ts">
  import JSONTree from "svelte-json-tree";
  import type ReaderModel from "$lib/models/readerModel";

  export let readerModel: ReaderModel;
</script>

<p>Details</p>
<p>{readerModel.name}</p>
<JSONTree value={$readerModel.metadata}/>
<p>Citations</p>
<pre id="json">{$readerModel.citations}</pre>

<style lang="postcss">
  #json {
    height:500px;
    width: 1000px;
    overflow-x: auto;
  }
</style>