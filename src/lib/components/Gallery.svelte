<script lang='ts'>
  import GalleryCard from './GalleryCard.svelte';
  const GALLERY_URL = 'https://oddant1.github.io/q2view-gallery';

  // TODO: Expect 404s and other such errors to happen here and handle them
  async function getGalleryCards() {
    const indexJSON = await (await fetch(GALLERY_URL)).json();
    let galleryEntries = [];

    for (const galleryEntry of Object.values(indexJSON)) {
      let galleryJSON = await (await fetch(GALLERY_URL + galleryEntry)).json();
      galleryJSON['img'] =  GALLERY_URL + galleryJSON['img'];
      galleryEntries.push(galleryJSON);
    }

    return galleryEntries;
  }
</script>

<h2>Gallery</h2>
<p>Don&apos;t have a QIIME 2 result of your own to view? Try one of these?</p>
{#await getGalleryCards() then galleryCards}
  <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each galleryCards as galleryCard}
      <GalleryCard {...galleryCard}/>
    {/each}
  </div>
{/await}
