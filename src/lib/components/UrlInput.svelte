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
{#if inputMode == 1}
<h3>
  Dropbox Instructions:
</h3>
<ol class="pl-10" style="list-style: decimal">
  <li>
    Find the file you would like to share.
  </li>
  <li>
    Create a shared link to it.
  </li>
  <li>
    Provide that link in the input form above and hit "Go!"
  </li>
</ol>
{:else if inputMode == 2}
<div class="grid lg:grid-cols-2">
  <div>
    <h3>
      Web URL Instructions
    </h3>
    <p>Provide a link to your file in the input form above and hit "Go!"</p>
    <p>Note: the server that is hosting your file must support CORS. See Required Headers for more information.</p>
  </div>
  <div>
    <h3>
      Known Supported Websites:
    </h3>
    <ul class="pl-10" style="list-style: disc">
      <li>
        docs.qiime2.org
      </li>
      <li>
        forum.qiime2.org
      </li>
      <li>
        websites hosted on Github Pages
      </li>
      <li>
        &lt;your webserver here&gt; (see Required Headers)
      </li>
    </ul>
  </div>
</div>
{/if}

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
