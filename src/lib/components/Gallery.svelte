<script lang="ts">
  import GalleryCard from "$lib/components/GalleryCard.svelte";
  const GALLERY_URL = "https://q2view-gallery.pages.dev/gallery/";

  let galleryEntries: Array<Object> = [];
  let filteredGalleryEntries: Array<Object> = [];

  let currentPage: number = 1;
  let numPages: number;
  // A 1440p screen fits two rows well. A 1080p screen JUST ABOUT fits one row.
  // There are 3 cards per row.
  let cardsPerPage: number = screen.height >= 1440 ? 6 : 3;

  let startIdx: number;
  let endIdx: number;

  // TODO: Expect 404s and other such errors to happen here and handle them
  async function getGalleryEntries() {
    let indexJSON;

    try {
      indexJSON = await (await fetch(GALLERY_URL + "index.json")).json();
    } catch(error) {}

    for(const galleryEntry of indexJSON) {
      let galleryJSON = Object();

      try {
        galleryJSON = await (await fetch(GALLERY_URL + galleryEntry + '/info.json')).json();
        galleryJSON["img"] =  GALLERY_URL + galleryEntry + '/thumb.png';
      } catch(error) {
        galleryJSON["title"] = "Missing Asset";
        galleryJSON["desc"] = "This asset failed to load with the following " +
          `error: "${error}." This could be a temporary local error resolved ` +
          "by reloading the page, or it could be an issue with the site " +
          "hosting the asset.";
      }

      galleryEntries.push(galleryJSON);
    }

    galleryEntries.sort(function(a: Object, b: Object) {
      return a["title" as keyof Object] > b["title" as keyof Object] ? 1 : -1;
    });

    filteredGalleryEntries.push(...galleryEntries);

    numPages = Math.ceil(filteredGalleryEntries.length / cardsPerPage);
    startIdx = 0;
    endIdx = cardsPerPage;
  }

  function applySearchFilter() {
    const searchBar = document.getElementById("searchInput") as HTMLInputElement;
    const searchFilter = searchBar.value.toLowerCase();

    filteredGalleryEntries = galleryEntries.filter(
      (e) => String(e["title" as keyof Object].toLowerCase()).startsWith(searchFilter)
    );
  }

  function changeCardsPerPage(event: Event) {
    const inputElement = document.getElementById(
      "setCardsPerPage",
    ) as HTMLInputElement;

    const currentVal = parseInt(inputElement.value);

    // If we have something less than 1 (should only ever be 0) or a NaN
    // then set this back to what it was before
    if (currentVal < 1 || currentVal !== currentVal) {
      inputElement.value = String(cardsPerPage);
    } else {
      cardsPerPage = currentVal;
    }

    numPages = Math.ceil(filteredGalleryEntries.length / cardsPerPage);

    if (numPages === 0) {
      numPages = 1;
    }

    // The num_pages could drop below the current page we're on. We don't
    // want to leave ourselves on some weird empty non page
    if (currentPage > numPages) {
      currentPage = numPages;
    }
  }
</script>

<h2>Gallery</h2>
<p class="pb-4">Don&apos;t have a QIIME 2 result of your own to view? Try one of these!</p>
<input id="searchInput" placeholder="search" on:input={applySearchFilter}/>
{#await getGalleryEntries()}
  <h3>Fetching Gallery...</h3>
{:then}
  {#if galleryEntries.length === 0}
    <h3>
      No gallery entries found. Try refreshing the page. If that doesn't work
      the gallery might be down.
    </h3>
  {:else}
    <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredGalleryEntries.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage) as galleryEntry}
        <GalleryCard {...galleryEntry}/>
      {/each}
    </div>
  {/if}
{/await}
<div id="pageControls">
  <div></div>
  <div class="mx-auto">
    <button
      on:click={() => {
          if (currentPage > 1) {
              currentPage--;
          }
      }}
    >
      <svg fill="none"
        width="20"
        height="20">
        <path
          stroke-width="5"
          stroke="rgb(119, 119, 119)"
          d="m16 0L6 10a0,2 0 0 1 1,1M6 10L16 20"/>
      </svg>
    </button>
    <div style="font-size: 27px; display: inline;">
      {currentPage}/{numPages}
    </div>
    <button
      on:click={() => {
        if (currentPage < numPages) {
          currentPage++;
        }
      }}
    >
      <svg fill="none"
        width="20"
        height="20">
        <path
          stroke-width="5"
          stroke="rgb(119, 119, 119)"
          d="m6 0L18 10a0,2 0 0 1 1,1M16 10L6 20"/>
      </svg>
    </button>
  </div>
  <div class="ml-auto" style="font-size: 20px">
    <span class="font-bold">Per Page:&nbsp;</span>
    <input
      id="setCardsPerPage"
      type="number"
      value={cardsPerPage}
      min="1"
      on:change={changeCardsPerPage}
    />
  </div>
</div>

<style lang="postcss">
  input {
    @apply border
    border-solid
    rounded
    border-gray-300
    mr-auto
    mt-auto
    pl-2
    mb-4;
  }

  #pageControls {
    @apply grid
    grid-cols-3
    pt-4;
  }

  button:hover {
    @apply bg-gray-300;
  }
</style>
