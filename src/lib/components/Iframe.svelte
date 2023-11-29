<script lang="ts">
    export let tab: number;
    export let indexPath: string;

    let isSelected = false;

    $: if(tab === 1) {
        isSelected = true;
    } else {
        isSelected = false;
    }
</script>

<div class:isSelected class='invisible'>
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

    div.isSelected {
        @apply visible;
    }
</style>