<script lang="ts">
    import type FileModel from "$lib/models/fileModel";

    export let fileModel: FileModel;
    export let tab: number;

    let files: FileList;
    let isDragging = false;
    let isSelected = false;

    function onDragOver(event: DragEvent) {
        isDragging = true;
        event.preventDefault();
    }

    function onDragLeave(event: DragEvent) {
        isDragging = false;
    }

    function onDrop(event: DragEvent) {
        isDragging = false;
        event.preventDefault();

        let items = event.dataTransfer?.files;

        if (items !== undefined) {
            files = items;
        }
    }

    $: if (files) {
        if (files.length > 1) {
            alert("Please only provide a single file.");
        }
        else {
            fileModel.setFile(files[0]);
        }
    }

    $: if (tab === 0) {
        isSelected = true;
    }  else {
        isSelected = false;
    }
</script>

<!-- I couldn't find a good answer for what ARIA role to give this, but the
    linter told me I needed one -->
<div
    id="dropzone"
    class="relative invisible"
    class:isDragging
    class:isSelected
    on:dragover={onDragOver}
    on:dragleave={onDragLeave}
    on:drop={onDrop}
    role="button"
    tabindex="0"
>
    <input bind:files type="file" accept=".qza, .qzv" class="opacity-0 absolute top-0 right-0 bottom-0 left-0 w-full h-full"/>
    <div class="text-xl text-gray-700 text-center">
        <h1 class="mt-2.5 text-2xl">Drag and drop or click here</h1>
        to view a QIIME 2 Artifact or Visualization (.qza/.qzv) from your computer.
    </div>
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

    #dropzone.isSelected {
        @apply visible;
    }
</style>