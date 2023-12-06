<script lang="ts">
  import { page } from "$app/stores"
  import readerModel from "$lib/models/readerModel";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  export let selectedTab: string;

  onMount(async() => {
    const src = $page.url.searchParams.get("src");

    if (src === null) {
      alert("Invalid URL. Lacking a src param.");
      readerModel.selectedTab = "input";
    }
    else {
      readerModel.selectedTab = selectedTab;
      await readerModel.readData(src);
    }

    goto("/");
  });

// History.pushstate to add arbitrary info to url in browser use this + routing
// To have more informative URL stuff
</script>