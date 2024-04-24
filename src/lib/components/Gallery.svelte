<script lang="ts">
  import GalleryCard from "./GalleryCard.svelte";
  const GALLERY_URL = "https://q2view-gallery.pages.dev";

  // TODO: Expect 404s and other such errors to happen here and handle them
  async function getGalleryCards() {
    let indexJSON;
    let galleryEntries = [];

    try {
      indexJSON = await (await fetch(GALLERY_URL + "/gallery/index.json")).json();
    } catch(error) {
      return galleryEntries;
    }

    for(const galleryEntry of Object.values(indexJSON)) {
      let galleryJSON = Object();

      try {
        galleryJSON = await (await fetch(GALLERY_URL + galleryEntry)).json();
        galleryJSON["img"] =  GALLERY_URL + galleryJSON["img"];
      } catch(error) {
        galleryJSON["title"] = "Missing Asset";
        galleryJSON["desc"] = "This asset failed to load with the following " +
          `error: "${error}." This could be a temporary local error resolved ` +
          "by reloading the page, or it could be an issue with the site " +
          "hosting the asset.";
      }

      galleryEntries.push(galleryJSON);
    }

    return galleryEntries;
  }
</script>

<h2>Gallery</h2>
<p class="pb-4">Don&apos;t have a QIIME 2 result of your own to view? Try one of these!</p>
{#await getGalleryCards()}
  <h3>Fetching Gallery...</h3>
{:then galleryCards}
  {#if galleryCards.length === 0}
    <h3>
      No gallery entries found. Try refreshing the page. If that doesn't work
      the gallery might be down.
    </h3>
  {:else}
    <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each galleryCards as galleryCard}
        <GalleryCard {...galleryCard}/>
      {/each}
    </div>
  {/if}
{/await}
