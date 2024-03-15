<script lang="ts">
  let isDropdownOpen = false;

  const handleDropdownClick = () => {
    isDropdownOpen = !isDropdownOpen;
  }
</script>

<button class="btn m-1" on:click={handleDropdownClick}>
  {#if isDropdownOpen}
    <svg
      fill="none"
      viewBox="0 0 24 24"
      class="inline-block h-6 w-6 stroke-current">
      <title>Close Dropdown</title>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12" />
    </svg>
  {:else}
    <svg
      fill="none"
      viewBox="0 0 24 24"
      class="inline-block h-6 w-6 stroke-current">
      <title>Open Dropdown</title>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  {/if}
</button>

<ul id="nav-dropdown" style:display={isDropdownOpen ? 'block' : 'none'}>
  <slot>
  </slot>
</ul>

<!-- <style lang="postcss">
  #nav-dropdown {
    @apply relative
  }
</style> -->
