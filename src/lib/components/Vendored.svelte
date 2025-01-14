<script>
  import NavBar from "$lib/components/VendoredNavBar.svelte";
  import ContentContainer from "$lib/components/VendoredContentContainer.svelte";

  import url from "$lib/scripts/url-store";

  import "../../app.css";
  import readerModel from "$lib/models/readerModel";

  import { onMount } from "svelte";
  import { checkBrowserCompatibility } from "$lib/scripts/util";

  async function getFileFromServer() {
    try {
      const fileName = $url.searchParams.get('file');

      if (fileName === null) {
        throw new Error('File searchParam not found. No file to load.');
      }

      const response = await fetch(`${window.location.origin}${fileName}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Received network response ${response}. Not OK.`);
      }

      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });
      readerModel.readData(file);
    } catch (error) {
      console.error(`There was a problem with the fetch operation: ${error}`);
    }
  }

  onMount(() => {
    checkBrowserCompatibility();
  });

  getFileFromServer();
</script>

<NavBar />
<ContentContainer />
