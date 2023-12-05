<script lang="ts">
  import readerModel from "$lib/models/readerModel";

  let inputMode: number = 0;

  function resolveURL() {
    const URLInputs = document.getElementsByClassName("URLInput");
    // This shouldn"t happen
    if (URLInputs.length > 1) {
      alert("Something went wrong, please refresh the page and try again");
    }
    else {
      let URLinput = (<HTMLInputElement>URLInputs[0]).value;
      readerModel.readData(URLinput);
    }
  }
</script>

<div>
  {#if inputMode === 0}
    <p>
      You can also provide a link to
      a <a on:click|preventDefault={() => (inputMode = 1)} role="button" >
        file on Dropbox</a> or
      a <a on:click|preventDefault={() => (inputMode = 2)} role="button">
        file from the web</a>.
    </p>
  {:else if inputMode === 1}
    <div class="absolute">
      <button on:click={() => (inputMode = 0)}>cancel</button>
      <input class="URLInput" placeholder="Shared link to a .qza/.qzv file on Dropbox" />
      <button on:click={() => resolveURL()}>Go!</button>
    </div>
  {:else if inputMode === 2}
    <div class="absolute">
      <button on:click={() => (inputMode = 0)}>cancel</button>
      <input class="URLInput" placeholder="URL to a .qza/.qzv file on the web" />
      <button on:click={() => resolveURL()}>Go!</button>
    </div>
  {/if}
</div>
