<script lang="ts">
	let isDragging = false;

	function onDragOver(event: DragEvent) {
		isDragging = true;
		console.log(isDragging);
		event.preventDefault();
	}

	function onDragExit(event: DragEvent) {
		isDragging = false;
	}

	function onDrop(event: DragEvent) {
		isDragging = false;
		console.log(event);
		event.preventDefault();
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