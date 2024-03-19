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
    margin-top: -21px;
    position: absolute;
    width: 100%;
    height: 100vw;
    left: 0%;
    top: inherit;
  }
</style>