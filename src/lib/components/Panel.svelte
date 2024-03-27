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
    border-gray-300
    rounded-md
    p-4
    mb-4;
  }

  .panel {
    @apply border
    border-gray-300
    rounded-b-md
    p-4
    mb-4;
  }

  .panel-header {
    border-top-width: 1px;
    border-right-width: 1px;
    border-left-width: 1px;
    @apply border-gray-300
    rounded-t-md
    p-2
    bg-gray-200;
  }

  :global(.danger-panel) {
    @apply border
    border-red-300
    rounded-md
    bg-red-100
    p-4
    mr-2;
  }
</style>

