<script lang="ts">
  interface ActionDetails {
    name: string;
    uuid: string;
    type: string;
    format: string | null;
  }

  export let resultJSON: ActionDetails;
</script>

<ul>
  <li>
    name: "{resultJSON.name}"
  </li>
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