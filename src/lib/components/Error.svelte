<script>
    import readerModel from "$lib/models/readerModel";
    import Panel from "$lib/components/Panel.svelte";
</script>

<div class="container">
  <h1 class="pb-2">{$readerModel.error}</h1>
  <Panel>
    <div class="danger-panel">
      <div role="alert">
        {$readerModel.errorMessage}
      </div>
    </div>
  </Panel>
    <p><strong>
      Please see the <a href="/about/#troubleshooting">troubleshooting section
    </a> for assistance.</strong></p>
</div>