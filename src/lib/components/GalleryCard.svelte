<script lang="ts">
  import readerModel from "$lib/models/readerModel";

  export let img: string;
  export let title: string;
  export let desc: string;
  export let href: string;

  // This function ensures that every time you click a "Try it!" button the referenced
  // viz reloads entirely to have consistent behavior
  function galleryButton() {
    readerModel.clear();
    history.pushState({}, "", "/visualization/" + href);
  }
</script>

<div class="gallery-card">
  <h3 style="font-size: 24px;">{title}</h3>
  <img src={img} alt={title}>
  <p style="font-size: 14px">{desc}</p>
  <p class="text-right" style="font-size: 14px">
    <button class="gallery-button" on:click={galleryButton}>
      Try it!
    </button>
  </p>
</div>

<style lang='postcss'>
  .gallery-card {
    @apply border
    border-gray-300
    rounded-lg
    p-2;
  }

  .gallery-button {
    @apply border
    bg-blue-700
    text-white
    rounded-md
    py-1
    px-4;
  }

  .gallery-button:hover {
    @apply bg-blue-800;
  }
</style>