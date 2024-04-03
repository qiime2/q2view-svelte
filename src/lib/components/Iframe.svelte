<script lang="ts">
  import readerModel from "$lib/models/readerModel";
  import { getScrollBarWidth } from "$lib/scripts/util";
</script>

<!-- The width and left are calculated to fill the scroll-gutters on the
   positioned-container.

  The +8px is to make up for the positioning of the positioned container-->
<iframe
  id="iframe"
  frameborder="0"
  src={$readerModel.indexPath}
  style:width={`calc(100% + 2 * ${getScrollBarWidth()}px)`}
  style:left={`calc(0% - ${getScrollBarWidth()}px)`}
/>

<!-- Position this manually so it takes up basically the entire viewport -->
<style lang="postcss">
  #iframe {
    margin-top: -21px;
    position: absolute;
    height: 100%;
  }
</style>