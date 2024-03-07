<script lang="ts">
  import readerModel from "$lib/models/readerModel";
</script>

<iframe
  id="iframe"
  frameborder="0"
  src={$readerModel.indexPath}
/>

<style lang="postcss">
  #iframe {
    position: absolute;
    width: 100%;
    height: calc(100% - 50px);
    left: calc(-50% + 50%);
  }
</style>