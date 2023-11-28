<script lang="ts">
    import type ViewModel from "$lib/models/viewModel";

    export let indexPath: string;
</script>

<div>
   <iframe
        id="iframe"
        frameborder="0"
        src={indexPath}
    />
</div>

<style lang="postcss">
    #iframe {
        @apply h-full
        w-full
        absolute;
    }
</style>