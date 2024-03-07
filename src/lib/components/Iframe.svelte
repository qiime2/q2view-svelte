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
    width: 100%;
    height: calc(100vh - 50px);
    position: absolute;
    left: calc(-50vw + 50%);
  }
</style>