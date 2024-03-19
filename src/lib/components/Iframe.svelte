<script lang="ts">
  import readerModel from "$lib/models/readerModel";
</script>

<iframe
  id="iframe"
  frameborder="0"
  src={$readerModel.indexPath}
/>

<!-- Position this manually so it takes up basically the entire viewport -->
<style lang="postcss">
  #iframe {
    position: absolute;
    width: 100%;
    height: calc(100% - 50px);
    left: 0%;
    top: 50px
  }
</style>