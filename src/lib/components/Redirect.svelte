<script lang="ts">
  import { page } from "$app/stores"
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import readerModel from "$lib/models/readerModel";

  if (browser) {
    const src = $page.url.searchParams.get("src");

    if (src === null) {
      alert("Invalid URL. Lacking a src param.");
    }
    else {
      readerModel.readData(src);
      goto("/");
    }
  }

// History.pushstate to add arbitrary info to url in browser use this + routing
// To have more informative URL stuff
</script>