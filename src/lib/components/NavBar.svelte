<script lang="ts">
  import Details from "$lib/components/Details.svelte"
  import Provenance from "$lib/components/Provenance.svelte"

  let tab: number = 0;
</script>

<ul id="menu">
  <li></li>
  <li><a href="/" on:click|preventDefault={() => (tab = 1)}>Details</a></li> |
  <li><a href="/" on:click|preventDefault={() => (tab = 2)}>Provenances</a></li>
</ul>

<style>
  ul#menu li{
    display : inline;
  }
</style>