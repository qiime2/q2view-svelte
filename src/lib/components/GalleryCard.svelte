<script lang="ts">
  export let img: string;
  export let title: string;
  export let desc: string;
  export let href: string;
</script>

<div>
  <h3>{title}</h3>
  <img src={img} alt={title}>
  <p>{desc}</p>
  <p class="text-right">
    <a href="{href}">
      <button>
        Try it!
      </button>
    </a>
  </p>
</div>