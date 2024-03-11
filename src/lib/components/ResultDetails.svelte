
<script lang="ts">
  interface ResultDetails {
    name: string | null;
    uuid: string;
    type: string;
    format: string | null;
  }

  export let resultJSON: ResultDetails;
</script>

<ul>
  {#if resultJSON.name !== null}
    <li>
      name: "{resultJSON.name}"
    </li>
  {/if}
  <li>
    uuid: "{resultJSON.uuid}"
  </li>
  <li>
    type: "{resultJSON.type}"
  </li>
  <li>
    format: "{resultJSON.format}"
  </li>
</ul>