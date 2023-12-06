<script lang="ts">
  import { page } from "$app/stores"
  import { browser } from "$app/environment";
  import readerModel from "$lib/models/readerModel";
  import { goto } from "$app/navigation";

  export let selectedTab: string;

  if (browser) {
    const src = $page.url.searchParams.get("src");

    if (src === null) {
      alert("Invalid URL. Lacking a src param.");
      readerModel.selectedTab = "input";
    }
    else {
      readerModel.selectedTab = selectedTab;
      readerModel.readData(src);
    }

    goto("/")
  }

// History.pushstate to add arbitrary info to url in browser use this + routing
// To have more informative URL stuff
</script>