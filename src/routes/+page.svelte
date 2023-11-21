<script lang="ts">
	import Iframe from "$lib/components/Iframe.svelte";
    import Details from "$lib/components/Details.svelte";
	import DropZone from "$lib/components/DropZone.svelte";
	import Provenance from "$lib/components/Provenance.svelte";

	import ViewModel from "$lib/models/viewModel";
	import FileModel from "$lib/models/fileModel";

	let viewModel: ViewModel = new ViewModel();
	let fileModel: FileModel = new FileModel();

	let tab: number = 0;
</script>

<ul id="menu">
	<li><a href="/" on:click|preventDefault={() => (tab = 0)}><img src="/q2view.png" alt="QIIME 2 view logo"></a></li> |
	<li><a href="/" on:click|preventDefault={() => (tab = 1)}>Visualization</a></li> |
	<li><a href="/" on:click|preventDefault={() => (tab = 2)}>Details</a></li> |
	<li><a href="/" on:click|preventDefault={() => (tab = 3)}>Provenance</a></li>
</ul>

<!-- We can probably just render all of these and either hide the ones we aren't currently showing or draw them over each other
 -->
{#if tab === 0}
	<DropZone {fileModel}/>
{/if}
{#await viewModel.initModelFromFile($fileModel)}
	<p>Loading...</p>
{:then}
	{#if viewModel.indexPath && tab === 1}
		<Iframe indexPath={viewModel.indexPath}/>
	{:else if tab === 2}
		<Details {viewModel}/>
	{:else if tab === 3}
		<Provenance {viewModel}/>
	{/if}
{/await}

<style>
	ul#menu li{
		display : inline;
	}
</style>