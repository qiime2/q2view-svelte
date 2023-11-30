<script lang="ts">
    import { FormGroup, InputGroup, Button, Input } from 'sveltestrap';

    let inputMode: number = 0;

    function resolveURL(dispatch, getState) {
        dispatch(updateLoadMessage('validating remote file'));
        const rawSrc = getRawSource(getState());

        return fetch(rawSrc.data, { method: 'HEAD', mode: 'cors' })
            .then((response) => {
                if (!response.ok) {
                    throw Error(`Network error, recieved ${response.status} from server.`);
                }
                return fetch(rawSrc.data).then(res => res.blob());
            }).then(Reader.createReaderFromFile).then((reader) => {
                dispatch(setSource(encodeURIComponent(rawSrc.data)));
                dispatch(setReader(reader));
            });
    }
</script>

<div>
    {#if inputMode === 0}
        <p>
            You can also provide a link to
            a <a on:click|preventDefault={() => (inputMode = 1)} role="button" >
                file on Dropbox</a> or
            a <a on:click|preventDefault={() => (inputMode = 2)} role="button">
                file from the web</a>.
        </p>
    {:else if inputMode === 1}
        <InputGroup class="absolute">
            <Button on:click={() => (inputMode = 0)}>cancel</Button>
            <Input placeholder="Shared link to a .qza/.qzv file on Dropbox" />
            <Button>Go!</Button>
        </InputGroup>
    {:else if inputMode === 2}
        <InputGroup class="absolute">
            <Button on:click={() => (inputMode = 0)}>cancel</Button>
            <Input placeholder="URL to a .qza/.qzv file on the web" />
            <Button>Go!</Button>
        </InputGroup>
    {/if}
</div>
