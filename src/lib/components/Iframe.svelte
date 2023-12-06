<script lang="ts">
  import readerModel from "$lib/models/readerModel";
</script>

<iframe
  id="iframe"
  frameborder="0"
  src={readerModel.indexPath}
/>

<style lang="postcss">
  #iframe {
    @apply h-full
    w-full
    fixed
    overflow-auto;
  }
</style>