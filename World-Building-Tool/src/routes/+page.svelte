<script>
  import Canvas from "./canvas.svelte";
  import welcome from "$lib/images/svelte-welcome.webp";
  import welcome_fallback from "$lib/images/svelte-welcome.png";
  import MapImage from "$lib/images/the-lord-of-the-rings-middle-earth-map-i109833.jpg";
  let mapImage, fileinput;

  const onFileSelected = (e) => {
    let image = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = (e) => {
      mapImage = e.target.result;
    };
  };
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<body>
  <button
    on:click={() => {
      fileinput.click();
    }}>choose image</button
  >
  {#if mapImage}
    <Canvas {mapImage}></Canvas>
  {:else}
    <img class="map_image" src={MapImage} alt="" />
  {/if}
  <input
    style="display:none"
    type="file"
    accept=".jpg, .jpeg, .png"
    on:change={(e) => onFileSelected(e)}
    bind:this={fileinput}
  />
</body>

<style>
  body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
