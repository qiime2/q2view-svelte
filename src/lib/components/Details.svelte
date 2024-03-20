<script lang="ts">
  import Panel from "$lib/components/Panel.svelte";
  import readerModel from "$lib/models/readerModel";
  import ResultDetails from "$lib/components/ResultDetails.svelte";

  const blob = new Blob([$readerModel.citations], { type: "text/plain" })
  const download = URL.createObjectURL(blob);
</script>

<Panel header="Details of {$readerModel.name}">
  <ResultDetails name={$readerModel.name} resultJSON={$readerModel.metadata}/>
</Panel>
<Panel header="Citations">
  <label for="citation-style">
    Citation Format:
    <select id="citation-style">
      <option value="bibtex">BibTex</option>
    </select>
  </label>
  <a href={download} download={`${$readerModel.metadata.uuid}.bib`} style="float: right">Download</a>
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