<script lang="ts">
  import type FileModel from "$lib/models/fileModel";

  export let fileModel: FileModel;

  let inputMode: number = 0;

  function resolveDropBox() {
    let input = (<HTMLInputElement>document.getElementById("dropBoxInput")).value;

    const source = new URL(input);
    source.searchParams.set('dl', '1');
    const path = `${source.pathname}?${source.searchParams}`
    const data = `https://dl.dropboxusercontent.com${path}`

    getRemoteFile(data);
  }

  function resolveURL() {
    let input = (<HTMLInputElement>document.getElementById("URLInput")).value;
    getRemoteFile(input);
  }

  async function getRemoteFile(url: string) {
    const file = await fetch(url).then((response) => {
      if (!response.ok) {
        throw Error(`Network error, recieved ${response.status} from server.`);
      }

      return response.blob();
    })

    fileModel.setFile(file)
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
      <button on:click={() => resolveDropBox()}>Go!</button>
    </div>
  {:else if inputMode === 2}
    <div class="absolute">
      <button on:click={() => (inputMode = 0)}>cancel</button>
      <input id="URLInput" placeholder="URL to a .qza/.qzv file on the web" />
      <button on:click={() => resolveURL()}>Go!</button>
    </div>
  {/if}
</div>
