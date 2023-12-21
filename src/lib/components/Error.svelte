<script>
    import readerModel from "$lib/models/readerModel";
</script>

<div class="container">
  <h1>{$readerModel.error}</h1>
  <div role="alert" class="alert alert-danger">
    {$readerModel.errorMessage}
  </div>
    <p><strong>
      Please see the <a href="/about/#troubleshooting">troubleshooting section
    </a> for assistance.</strong></p>
</div>