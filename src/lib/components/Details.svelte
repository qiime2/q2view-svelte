<script lang="ts">
  import Panel from "$lib/components/Panel.svelte";
  import readerModel from "$lib/models/readerModel";
  import FormatterModel from "$lib/models/formatterModel";
  import ResultDetails from "$lib/components/ResultDetails.svelte";

  let citationStyle: string = "bib";
  const formatterModel = new FormatterModel();

  // If the user refreshes then we need to react to the citations being set
  // when we are already on this page
  //
  // They will be undefined for a sec and it will flash "No Citations" then
  // when they are actually loaded by the ReaderModel this willr react to that
  $: {
    if ($readerModel.citations !== undefined) {
      formatterModel.setFormatter($readerModel.citations);
      formatterModel.formatCitations(citationStyle);
    }
  }
</script>

<Panel header="Details of {$readerModel.name}">
  <ResultDetails name={$readerModel.name} resultJSON={$readerModel.metadata}/>
</Panel>
<Panel header="Citations">
  <label for="citation-style">
    Citation Format:
    <!-- TODO: It takes a bit of time to react to changing this style. Feels a bit jank need some feedback -->
    <select bind:value={citationStyle} id="citation-style" on:change={() => formatterModel.formatCitations(citationStyle)}>
      <option value="apa">APA</option>
      <option value="asm">ASM</option>
      <option selected={true} value="bib">BibTex</option>
      <option value="cell">Cell</option>
      <option value="chicago">Chicago</option>
      <option value="mla">MLA</option>
      <option value="nature">Nature</option>
      <option value="ris">RIS</option>
    </select>
  </label>
  {#if $readerModel.citations !== undefined}
    <a href={$formatterModel.downloadableFile} download={`${$readerModel.metadata.uuid}.${$formatterModel.fileExt}`} style="float: right">Download</a>
    <pre id="citations">{$formatterModel.formattedCitations}</pre>
  {:else}
    <pre id="citations">No Citations</pre>
  {/if}
</Panel>

<style lang="postcss">
  #citation-style {
    @apply border
    border-gray-300;
  }

  #citations {
    @apply border
    border-gray-300
    bg-gray-100
    overflow-x-auto
    p-2
    text-xs
    mt-2;
  }
</style>