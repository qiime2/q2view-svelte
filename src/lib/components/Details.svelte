<script lang="ts">
    import JSONTree from "svelte-json-tree";
    import type ViewModel from "$lib/models/viewModel";

    export let viewModel: ViewModel;
</script>

<p>Details</p>
<p>{viewModel.name}</p>
<JSONTree value={$viewModel.metadata}/>
<p>Citations</p>
<pre>{$viewModel.citations}</pre>