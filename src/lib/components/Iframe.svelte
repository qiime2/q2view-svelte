<script lang="ts">
  import readerModel from "$lib/models/readerModel";

  // Taken from https://stackoverflow.com/a/8079681
  //
  // Creates an invisible div then calculates the difference between the width
  // of that div with a scrollbar and without a scrollbar to get the scrollbar
  // width
  function getScrollBarWidth () {
    const inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    const outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);

    document.body.appendChild(outer);
    const w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    let w2 = inner.offsetWidth;
    if (w1 == w2) {
      w2 = outer.clientWidth;
    }

    document.body.removeChild(outer);

    return (w1 - w2);
  };

  console.log(getScrollBarWidth());
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