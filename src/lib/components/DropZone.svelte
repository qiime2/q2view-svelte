<script lang="ts">
    import type FileModel from "$lib/models/fileModel";

	export let fileModel: FileModel;

	let isDragging = false;

	function onDragOver(event: DragEvent) {
		isDragging = true;
		event.preventDefault();
	}

	function onDragExit(event: DragEvent) {
		isDragging = false;
	}

// <iframe frameborder="0" src="/_/ja00b96kk5j/50ff4745-c579-4a11-acec-5c8daca97a3f/data/index.html" style="width: 100%; height: 100%; position: absolute;"></iframe>
// The source for this iframe is obtained via a get request that is intercepted by the service worker
// URLs that start with _ are intercepted by the service worker. The next bit is the session id

	function onDrop(event: DragEvent) {
		event.preventDefault();
		let items = event.dataTransfer?.files;
		isDragging = false;

		// TODO: Ensure we actually just have one file here not a dir or something
		if (!items) {
			return;
		}

		fileModel.setFile(items[0]);
	}
</script>

<div
	id="dropzone"
	class:isDragging
	on:dragover={onDragOver}
	on:dragexit={onDragExit}
	on:drop={onDrop}
>
	<div id="boxtitle" class="text-2xl text-gray-700">Drop Files Here</div>
</div>

<style lang="postcss">
	#dropzone {
		@apply border-4
			border-dashed
			border-gray-300
			rounded-lg
			w-full
			p-12
			bg-gray-200
			flex
			flex-row
			justify-center;
	}

	#dropzone.isDragging {
		@apply border-solid
			shadow-inner
			font-bold
			outline
			outline-2
			outline-blue-500;
	}
</style>