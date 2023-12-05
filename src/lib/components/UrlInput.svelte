<script lang="ts">
  import readerModel from "$lib/models/readerModel";

  let inputMode: number = 0;

  function resolveDropBoxURL() {
    let input = (<HTMLInputElement>document.getElementById("dropBoxInput")).value;
    readerModel.readData(input, "DropBoxURL");
  }

  function resolveFileURL() {
    let input = (<HTMLInputElement>document.getElementById("URLInput")).value;
    readerModel.readData(input, "FileURL");
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
      <input id="dropBoxInput" placeholder="Shared link to a .qza/.qzv file on Dropbox" />
      <button on:click={() => resolveDropBoxURL()}>Go!</button>
    </div>
  {:else if inputMode === 2}
    <div class="absolute">
      <button on:click={() => (inputMode = 0)}>cancel</button>
      <input id="URLInput" placeholder="URL to a .qza/.qzv file on the web" />
      <button on:click={() => resolveFileURL()}>Go!</button>
    </div>
  {/if}
</div>
