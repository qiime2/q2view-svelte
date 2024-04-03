<script lang="ts">
  import readerModel from "$lib/models/readerModel";

  let inputMode = 0;

  function resolveURL() {
    const inputElement = document.getElementById("URLInput") as HTMLInputElement;

    // This shouldn"t happen. If the user is able to click the button a URLInput
    if (inputElement === null) {
      alert("Something went wrong, please refresh the page and try again.");
    }
    else {
      let inputURL = inputElement.value;

      if (inputURL) {
        inputMode = 0;
        readerModel.clear();
        history.pushState({}, "", "/?src="+inputURL);
      }
    }
  }
</script>

<div style="text-align: center" class="py-4">
  {#if inputMode === 0}
    <p>
      You can also provide a link to
      a <a href="#" on:click|preventDefault={() => {inputMode = 1}} role="button" >
        file on Dropbox</a> or
      a <a href="#" on:click|preventDefault={() => {inputMode = 2}} role="button">
        file from the web</a>.
    </p>
  {:else}
    <div id="input">
      <button id="cancel-button" on:click={() => {inputMode = 0}}>cancel</button>
      {#if inputMode === 1}
        <input id="URLInput" placeholder="Shared link to a .qza/.qzv file on Dropbox" />
      {:else}
        <input id="URLInput" placeholder="URL to a .qza/.qzv file on the web" />
      {/if}
      <button id="submit-button" on:click={() => resolveURL()}>Go!</button>
    </div>
  {/if}
</div>
{#if inputMode === 1}
  <div class="pb-4">
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
  </div>
{:else if inputMode === 2}
  <div class="grid lg:grid-cols-2 pb-4">
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
  #input {
    font-size: 20px;
    height: 50px;
    @apply flex
    border
    border-gray-300
    rounded-md;
  }

  #cancel-button {
    border-top-leftradius: 6px;
    border-bottom-left-radius: 6px;
    border-right: 1px solid;
    @apply border-gray-300
    bg-gray-100
    mr-auto
    px-2;
  }

  #cancel-button:hover {
    @apply bg-gray-300;
  }

  #URLInput {
    @apply w-full
    px-2;
  }

  #submit-button {
    color: white;
    overflow: hidden;
    border-left: 1px solid;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    @apply border-gray-300
    bg-blue-700
    ml-auto
    px-2
  }

  #submit-button:hover {
    @apply bg-blue-800;
  }
</style>
