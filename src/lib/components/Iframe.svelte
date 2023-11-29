<script lang="ts">
    export let indexPath: string;
</script>

<iframe
    id="iframe"
    frameborder="0"
    src={indexPath}
/>

<style lang="postcss">
    #iframe {
        @apply h-full
        w-full
        absolute;
    }
</style>