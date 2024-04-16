<script lang="ts">
  import Panel from "$lib/components/Panel.svelte";
  import readerModel from "$lib/models/readerModel";
  import FormatterModel from "$lib/models/formatterModel";
  import ResultDetails from "$lib/components/ResultDetails.svelte";
  import { onMount } from "svelte";

  let citationStyle: string = "bib";
  const formatterModel = new FormatterModel();

  onMount(() => {
    if ($readerModel.citations !== undefined) {
      formatterModel.formatCitations(citationStyle);
    }
  });
</script>

<Panel header="Details of {$readerModel.name}">
  <ResultDetails name={$readerModel.name} resultJSON={$readerModel.metadata}/>
</Panel>
<Panel header="Citations">
  <label for="citation-style">
    Citation Format:
    <select bind:value={citationStyle} id="citation-style" on:change={() => formatterModel.formatCitations(citationStyle)}>
      <option selected={true} value="bib">BibTex</option>
      <option value="asm">ASM</option>
      <option value="cell">Cell</option>
      <option value="chicago">Chicago</option>
      <option value="mla">MLA</option>
      <option value="nature">Nature</option>
      <option value="ris">RIS</option>
    </select>
  </label>
  {#if $readerModel.citations !== undefined}
    <a href={formatterModel.getDownload()} download={`${$readerModel.metadata.uuid}.${$formatterModel.fileExt}`} style="float: right">Download</a>
    <pre id="json">{$formatterModel.formattedCitations}</pre>
  {:else}
    <pre id="json">No Citations</pre>
  {/if}
</Panel>

<style lang="postcss">
  #citation-style {
    @apply border
    border-gray-300;
  }

  #json {
    @apply border
    border-gray-300
    bg-gray-100
    overflow-x-auto
    p-2
    text-xs
    mt-2;
  }
</style>