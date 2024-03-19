<script lang="ts">
  import readerModel from "$lib/models/readerModel";

  // Adapted from https://stackoverflow.com/a/8079681
  //
  // Creates an invisible div with a 100% width child that overflows in y then
  // calculates the difference between the width of the outer div and the width
  // of the inner div with the scroll.
  function getScrollBarWidth () {
    // Create outer div
    const outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "scroll";

    // Create inner div that is taller than inner div
    const inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    // Make inner div a child of outer div
    outer.appendChild(inner);
    // Add outer div to the document
    document.body.appendChild(outer);

    // Get the width of the inner div. Since this div is set to 100% width it
    // will be the width of the outer div MINUS the width of the scrollbar
    // because the scrollbar width cuts into the div width
    const withScrollWidth = inner.offsetWidth;
    // Get the width of the outer div which is the same as the width of the
    // inner div would be without a scroll bar since the inner div width is set
    // to 100% of the outer div width
    const withoutScrollWidth = outer.offsetWidth;

    // Remove this dummy div from the DOM
    document.body.removeChild(outer);

    // Return difference in widths, this is the width of the scrollbar
    return (withoutScrollWidth - withScrollWidth);
  };
</script>

<!-- The width and left are calculated to fill the scroll-gutters on the
   positioned-container -->
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