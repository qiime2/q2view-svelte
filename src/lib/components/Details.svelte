<script lang="ts">
  import Panel from "$lib/components/Panel.svelte";
  import readerModel from "$lib/models/readerModel";
  import FormatterModel from "$lib/models/formatterModel";
  import ResultDetails from "$lib/components/ResultDetails.svelte";

  let citations: HTMLElement;
  const formatterModel = new FormatterModel();

  // If the user refreshes then we need to react to the citations being set
  // when we are already on this page
  //
  // They will be undefined for a sec and it will flash "No Citations" then
  // when they are actually loaded by the ReaderModel this will react to that
  $: {
    if ($readerModel.citations !== undefined) {
      formatterModel.setState($readerModel.citations);
      formatterModel.formatCitations();
    }
  }

  $: {
    if (citations !== undefined) {
      let newInnerHTML = "";

      if ($formatterModel.citationStyle === 'bib' || $formatterModel.citationStyle === 'ris') {
        newInnerHTML = "<pre>" + formatterModel.formattedCitations + "</pre>";
      } else {
        newInnerHTML = formatterModel.formattedCitations;
      }

      citations.innerHTML = newInnerHTML;
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
    <select bind:value={formatterModel.citationStyle} id="citation-style" on:change={() => formatterModel.formatCitations()}>
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
    <div id="citations" bind:this={citations}></div>
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
    text-xs
    p-2
    mt-2;
  }
</style>