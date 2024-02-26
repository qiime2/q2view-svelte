<script lang='ts'>
  import GalleryCard from './GalleryCard.svelte';

  // TODO: We need to move the gallery assets to an external github repo that
  // this data will be pulled from. This will make it so we can update the
  // gallery dynamically without rebuilding the site.
  async function getGalleryCards() {
    const indexJSON = await (await fetch('/gallery/index.json')).json();
    let galleryEntries = [];

    for (const galleryEntry of Object.values(indexJSON)) {
      const galleryJSON = await (await fetch(galleryEntry)).json();
      galleryEntries.push(galleryJSON);
    }

    return galleryEntries;
  }
</script>

<h2>Gallery</h2>
<p>Don&apos;t have a QIIME 2 result of your own to view? Try one of these?</p>
<div class="container">
  <div class="row">
    {#await getGalleryCards() then galleryCards}
      {#each galleryCards as galleryCard}
        <div class="col-xs-12 col-sm-6 col-md-4">
          <GalleryCard {...galleryCard}/>
        </div>
      {/each}
    {/await}
  </div>
</div>

<style lang='postcss'>
</style>