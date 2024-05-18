<script>
  import { onMount } from "svelte";
  let size = 1000;
  let cities = [];
  export let color = "#FFFFFFFF";
  let canvas;
  let context;
  let isDrawing;
  let city = false;
  const smoothing = 3;
  let smoothingCounter = smoothing;
  let start;
  let imageData;
  let t, l;
  export let mapImage;

  let lineWidth = 10;

  function getImageData() {
    let map = context.getImageData(0, 0, size, size, {
      colorSpace: "srgb",
    }).data;
    // let readAble = [[]];
    // for (let i = 0; i <= size * size; i += 4) {
    //   readAble.push([]);
    //   readAble[i / 4].push(map[i]);
    //   readAble[i / 4].push(map[i + 1]);
    //   readAble[i / 4].push(map[i + 2]);
    //   readAble[i / 4].push(map[i + 3]);
    // }
    // console.log(readAble);
    console.log(map);
    return map;
  }
  function putImageData(map) {
    context.putImageData(map);
  }

  async function sendCities() {
    let id = "undefined";
    // if (Auth.auth.currentUser) {
    //     id = await Auth.auth.currentUser.getIdToken(true);
    // }
    let headersList = {
      id: id,
    };
    let graph = getImageData();
    let bodyList = {
      cities: cities,
      graph: graph,
    };
    try {
      await fetch("http://localhost:8080/dijkstra/send", {
        method: "POST",
        headers: headersList,
        body: JSON.stringify(bodyList),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  //CANVAS DRAWING RELATED
  onMount(() => {
    context = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });
    context.lineWidth = lineWidth;
    //context.globalAlpha = 0.1;
    handleSize();
    console.log(getImageData());
    imageData = getImageData();
  });

  $: if (context) {
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
  }

  const handleStart = ({ offsetX: x, offsetY: y }) => {
    smoothingCounter = smoothing;
    isDrawing = true;
    start = { x, y };
    context.beginPath();
  };

  const handleEnd = ({ offsetX: x1, offsetY: y1 }) => {
    isDrawing = false;
    if (city) {
      cities.push(`${x1},${y1}`);
      let tempColor = color;
      color = "FFAACCFF";
      context.arc(x1, y1, 50, 0, 2 * Math.PI);
      context.stroke();
      color = tempColor;
    }
    city = false;
    context.closePath();
  };
  const handleMove = ({ offsetX: x1, offsetY: y1 }) => {
    if (!isDrawing || city) return;
    console.log(x1, y1);
    const { x, y } = start;
    context.moveTo(x, y);
    context.lineCap = "round";
    context.lineTo(x1, y1);
    if (smoothingCounter % smoothing == 0) {
      context.closePath();
      context.stroke();
      smoothingCounter = 0;
      context.beginPath();
    }
    smoothingCounter++;
    start = { x: x1, y: y1 };
  };

  const handleSize = () => {
    const { top, left } = canvas.getBoundingClientRect();
    t = top;
    l = left;
  };
</script>

<svelte:head>
  <title>About</title>
  <meta name="description" content="About this app" />
</svelte:head>

<div
  class="text-column"
  style="background-image: url({mapImage});
background-size: contain;
background-repeat: no-repeat;"
>
  <canvas style="opacity: 0.5;"
    bind:this={canvas}
    width={size}
    height={size}
    on:mousedown={handleStart}
    on:touchstart={(e) => {
      const { clientX, clientY } = e.touches[0];
      handleStart({
        offsetX: clientX - l,
        offsetY: clientY - t,
      });
    }}
    on:mouseup={handleEnd}
    on:touchend={handleEnd}
    on:mouseleave={handleEnd}
    on:mousemove={handleMove}
    on:touchmove={(e) => {
      const { clientX, clientY } = e.touches[0];
      handleMove({
        offsetX: clientX - l,
        offsetY: clientY - t,
      });
    }}
  ></canvas>
  <input type="text" bind:value={lineWidth} />
  <button on:click={getImageData}>HELLO</button>
  <button
    on:click={() => {
      color = "#FF0000FF";
    }}>RED</button
  >
  <button
    on:click={() => {
      color = "#10AAFFFF";
    }}>BLUE</button
  >
  <button
    on:click={() => {
      color = "#00FF00FF";
    }}>GREEN</button
  >
  <button
    on:click={() => {
      city = true;
    }}>CITY</button
  >
  <button on:click={sendCities}>SEND</button>
</div>
