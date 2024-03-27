<script lang="ts">
  export let img: string;
  export let title: string;
  export let desc: string;
  export let href: string;
</script>

<div class="gallery-card">
  <h3 style="font-size: 24px;">{title}</h3>
  <img src={img} alt={title}>
  <p style="font-size: 14px">{desc}</p>
  <p class="text-right" style="font-size: 14px">
    <button class="gallery-button" on:click={() => (history.pushState({}, "", href))}>
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
    color: white;
    background-color: rgb(51, 122, 183);
    @apply border
    border-gray-300
    rounded-lg
    p-1;  }
</style>