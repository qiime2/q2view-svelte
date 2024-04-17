<script lang="ts">
  import readerModel from "$lib/models/readerModel";
  import { getScrollBarWidth } from "$lib/scripts/util";
</script>

<iframe
  id="iframe"
  frameborder="0"
  src={$readerModel.indexPath}
/>

<!-- Position this manually so it takes up basically the entire viewport -->
<style lang="postcss">
  #iframe {
    left: 0px;
    margin-top: -21px;
    @apply absolute
    w-full
    h-full;
  }
</style>