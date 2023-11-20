<script lang="ts">
	import Iframe from "$lib/components/Iframe.svelte";
	import DropZone from "$lib/components/DropZone.svelte";

	import ViewModel from "$lib/models/viewModel";
	import FileModel from "$lib/models/fileModel";

	let viewModel: ViewModel = new ViewModel();
	let fileModel: FileModel = new FileModel();
</script>

<div class="bg-gray-200 rounded-2xl p-2 border-gray-300 border">
	<DropZone {fileModel}/>
</div>
{#await viewModel.initModelFromFile($fileModel)}
	<p>Loading...</p>
{:then}
	{#if viewModel.indexPath}
		<Iframe indexPath={viewModel.indexPath}/>
	{/if}
{/await}