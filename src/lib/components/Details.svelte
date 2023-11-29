<script lang="ts">
    import JSONTree from "svelte-json-tree";
    import type ViewModel from "$lib/models/viewModel";

    export let tab: number;
    export let viewModel: ViewModel;

    let isSelected = false;

    $: if(tab === 2) {
        isSelected = true;
    } else {
        isSelected = false;
    }
</script>

<div class:isSelected class='invisible'>
    <p>Details</p>
    <p>{viewModel.name}</p>
    <JSONTree value={$viewModel.metadata}/>
    <p>Citations</p>
    <pre>{$viewModel.citations}</pre>
</div>

<style lang="postcss">
    div.isSelected {
        @apply visible;
    }
</style>