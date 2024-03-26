
<script lang="ts">
  interface ResultDetails {
    uuid: string;
    type: string;
    format: string | null;
  }

  export let name: string | null = null;
  export let resultJSON: ResultDetails;
</script>

<ul>
  {#if name !== null}
    <li>
      <label>
        name:
      </label>
      "{name}"
    </li>
  {/if}
  <li>
    <label>
      uuid:
    </label>
    "{resultJSON.uuid}"
  </li>
  <li>
    <label>
      type:
    </label>
    "{resultJSON.type}"
  </li>
<!-- TODO: This way of styling this sucks. I need to more generically
  style strings vs non-strings in these json dumps -->
{#if resultJSON.format === null}
  <li id="null">
    <label>
      format:
    </label>
    {resultJSON.format}
  </li>
{:else}
  <li>
    <label>
      format:
    </label>
    "{resultJSON.format}"
  </li>
{/if}
</ul>

<style lang="postcss">
  li {
    color: rgb(108, 129, 55);
  }

  label {
    color: rgb(51, 122, 183);
  }

  #null {
    color: rgb(173, 103, 40);
  }
</style>
