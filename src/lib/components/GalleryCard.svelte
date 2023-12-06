<script lang="ts">
  export let img: string;
  export let title: string;
  export let desc: string;
  export let href: string;
</script>

<div>
  <img src={img} alt={title}>
  <h3>{title}</h3>
  <p>{desc}</p>
  <p class="text-right">
    <a href="/visualization{href}">
      <button>
        Try it!
      </button>
    </a>
  </p>
</div>