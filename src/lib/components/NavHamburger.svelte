<script lang="ts">
  let isDropdownOpen = false;

  const handleDropdownClick = () => {
    isDropdownOpen = !isDropdownOpen;
  }
</script>



<ul id="nav-dropdown" style:display={isDropdownOpen ? 'block' : 'none'}>
  <slot>
  </slot>
</ul>

<!-- <style lang="postcss">
  #nav-dropdown {
    @apply absolute
  }
</style> -->
