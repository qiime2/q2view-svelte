<script lang='ts'>
  import GalleryCard from './GalleryCard.svelte';

  const taxaObj = {
      title: 'Taxonomic Bar Plots',
      desc: 'Explore the taxonomy of samples in the Moving Pictures Tutorial. Try '
              + 'selecting different taxonomic levels and metadata-based sample sorting.',
      href: '/?type=html&src=https%3A%2F%2Fdocs.qiime2.org%2F2023.2%2Fdata%2F'
              + 'tutorials%2Fmoving-pictures%2Ftaxa-bar-plots.qzv',
      img: '/taxa_thumb.png'
  };

  const volObj = {
      title: 'Volatility Control Chart',
      desc: 'Explore interactive line plots to assess how volatile a dependent variable '
              + 'is over a continuous, independent variable in one or more groups.',
      href: '/?type=html&src=https%3A%2F%2Fdocs.qiime2.org%2F2023.2%2Fdata'
              + '%2Ftutorials%2Flongitudinal%2Fvolatility.qzv',
      img: '/volatility_thumb.png'
  };

  const empObj = {
      title: 'Emperor Ordination',
      desc: 'View the differences between sample composition using unweighted UniFrac in '
              + 'ordination space. Color the samples by different metadata columns.',
      href: '/?type=html&src=https%3A%2F%2Fdocs.qiime2.org%2F2023.2%2Fdata%2F'
              + 'tutorials%2Fmoving-pictures%2Fcore-metrics-results%2Funweighted_'
              + 'unifrac_emperor.qzv',
      img: '/emperor_thumb.png'
  };

  const sumObj = {
      title: 'Feature Table Summary',
      desc: 'Preview the impact of rarefying your data by manipulating the sampling '
              + 'depth to determine which samples or sample groups would be filtered.',
      href: '/?type=html&src=https%3A%2F%2Fdocs.qiime2.org%2F2023.2%2Fdata%2F'
              + 'tutorials%2Fmoving-pictures%2Ftable.qzv',
      img: '/summarize_thumb.png'
  };

  const alphaRObj = {
      title: 'Alpha Rarefaction Plots',
      desc: 'Explore alpha diversity as a function of sampling depth using the qiime '
              + 'diversity alpha-rarefaction visualizer.',
      href: '/?type=html&src=https%3A%2F%2Fdocs.qiime2.org%2F2023.2%2Fdata%2F'
              + 'tutorials%2Fmoving-pictures%2Falpha-rarefaction.qzv',
      img: '/alpha_rarefaction_thumb.png'
  };

  const alphaSObj = {
      title: 'Alpha Diversity Boxplots',
      desc: 'View the association between categorical metadata columns and alpha '
              + 'diversity data for Faith Phylogenetic Diversity and evenness metrics.',
      href: '/?type=html&src=https%3A%2F%2Fdocs.qiime2.org%2F2023.2%2Fdata%2Ftutorials'
              + '%2Fmoving-pictures%2Fcore-metrics-results%2Ffaith-pd-group-significance.qzv',
      img: '/alpha_significance_thumb.png'
  };
</script>

<h2>Gallery</h2>
<p>Don&apos;t have a QIIME 2 result of your own to view? Try one of these?</p>

<div class='grid grid-cols-3 grid-rows-2'>
  <div>
    <GalleryCard {...taxaObj}/>
  </div>
  <div>
    <GalleryCard {...volObj}/>
  </div>
  <div>
    <GalleryCard {...empObj}/>
  </div>
  <div>
    <GalleryCard {...sumObj}/>
  </div>
  <div>
    <GalleryCard {...alphaRObj}/>
  </div>
  <div>
    <GalleryCard {...alphaSObj}/>
  </div>
</div>

<style lang='postcss'>
</style>