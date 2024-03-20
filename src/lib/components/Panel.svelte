<script lang="ts">
  export let header: string = "";
</script>

<div>
  {#if header !== ""}
    <div class="panel-header">
      {header}
    </div>
  {/if}
  <div class={header === "" ? "headerless-panel" : "panel"}>
    <slot>
    </slot>
  </div>
</div>

<style lang='postcss'>
  .headerless-panel {
    @apply border
    border-black
    rounded-md
    p-2
    mb-2;
  }

  .panel {
    @apply border
    border-black
    rounded-b-md
    p-2
    mb-2;
  }

  .panel-header {
    border-top-width: 1px;
    border-right-width: 1px;
    border-left-width: 1px;
    @apply border-black
    rounded-t-md
    pl-2
    bg-gray-200;
  }

  :global(.danger-panel) {
    @apply border
    border-red-300
    rounded-md
    bg-red-100
    p-2
    mr-2;
  }
</style>

