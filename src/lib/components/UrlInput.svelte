<script lang="ts">
    import { format } from "prettier";

  let inputMode: number = 0;

  function resolveURL() {
    const inputElements = document.getElementsByClassName("URLInput");
    // This shouldn"t happen
    if (inputElements.length > 1) {
      alert("Something went wrong, please refresh the page and try again");
    }
    else {
      let inputElement = (<HTMLInputElement>inputElements[0]);
      let inputURL = inputElement.value;
      inputElement.value = "";

      history.pushState({}, "", "/?src="+inputURL);
    }
  }
</script>

<div style="text-align: center">
  {#if inputMode === 0}
    <p>
      You can also provide a link to
      a <span on:click|preventDefault={() => (inputMode = 1)} role="button" >
        file on Dropbox</span> or
      a <span on:click|preventDefault={() => (inputMode = 2)} role="button">
        file from the web</span>.
    </p>
  {:else}
    <div id="input">
      <button id="cancel-button" on:click={() => (inputMode = 0)}>cancel</button>
      {#if inputMode == 1}
        <input id="URLInput" placeholder="Shared link to a .qza/.qzv file on Dropbox" />
      {:else}
        <input id="URLInput" placeholder="URL to a .qza/.qzv file on the web" />
      {/if}
      <button id="submit-button" on:click={() => resolveURL()}>Go!</button>
    </div>
  {/if}
</div>

<style lang="postcss">
  span {
    cursor: pointer;
    color: blue;
    text-decoration: underline;
  }

  #input {
    @apply flex
    border
    border-black
    rounded-md;
  }

  #cancel-button {
    border-right: 1px solid;
    @apply mr-auto
    px-2;
  }
  #URLInput {
    @apply w-full
    pl-2;
  }

  #submit-button {
    border-left: 1px solid;
    @apply ml-auto
    px-2
    bg-blue-400;
  }
</style>
