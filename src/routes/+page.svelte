<script lang="ts">
	import Iframe from "$lib/components/Iframe.svelte";
	import DropZone from "$lib/components/DropZone.svelte";

	import ViewModel from "$lib/models/viewModel";
	import FileModel from "$lib/models/fileModel";

	let viewModel: ViewModel = new ViewModel();
	let fileModel: FileModel = new FileModel();
</script>

<DropZone {fileModel}/>
{#await viewModel.initModelFromFile($fileModel)}
	<p>Loading...</p>
{:then}
	{#if viewModel.indexPath}
		<Iframe indexPath={viewModel.indexPath}/>
	{/if}
{/await}