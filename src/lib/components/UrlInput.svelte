<script lang="ts">
  let inputMode: number = 0;

  function resolveURL() {
    const inputElements = document.getElementsByClassName("URLInput");
    // This shouldn"t happen
    if (inputElements.length > 1) {
      alert("Something went wrong, please refresh the page and try again");
    } else {
      let inputElement = <HTMLInputElement>inputElements[0];
      let inputURL = inputElement.value;
      inputElement.value = "";

      history.pushState({}, "", "/?src=" + inputURL);
    }
  }
</script>

<div>
  {#if inputMode === 0}
    <p>
      You can also provide a link to a <span
        on:click|preventDefault={() => (inputMode = 1)}
        role="button"
      >
        file on Dropbox</span
      >
      or a
      <span on:click|preventDefault={() => (inputMode = 2)} role="button">
        file from the web</span
      >.
    </p>
  {:else if inputMode === 1}
    <div>
      <button on:click={() => (inputMode = 0)}>cancel</button>
      <input
        class="URLInput"
        placeholder="Shared link to a .qza/.qzv file on Dropbox"
      />
      <button on:click={() => resolveURL()}>Go!</button>
    </div>
  {:else if inputMode === 2}
    <div>
      <button on:click={() => (inputMode = 0)}>cancel</button>
      <input
        class="URLInput"
        placeholder="URL to a .qza/.qzv file on the web"
      />
      <button on:click={() => resolveURL()}>Go!</button>
    </div>
  {/if}
</div>

<style lang="postcss">
  span {
    cursor: pointer;
    color: blue;
    text-decoration: underline;
  }
</style>
