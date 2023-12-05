<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import readerModel from '$lib/models/readerModel';

  if (browser) {
    let  type = '';
    const src = $page.url.searchParams.get('src');

    if (src === null) {
      throw "Bad";
    }

    const source = new URL(src)

    if (source.hostname === 'www.dropbox.com') {
      type = 'DropBoxURL';
    }
    else {
      type = 'FileURL'
    }

    readerModel.readData(src, type);
    goto('/');
  }
</script>