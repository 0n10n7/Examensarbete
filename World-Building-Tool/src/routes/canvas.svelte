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
  let pathlist = [];

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
  function putImageData(paths) {
    let image = context.getImageData(0, 0, size, size);
    paths.forEach((path) => {
      pathlist.push({
        name: `path ${pathlist.length + 1}`,
        path: path,
      });
      pathlist = pathlist;
      path.forEach((node) => {
        console.log(node);
        let x = node.split(",");
        let y = x[1];
        x = x[0];
        let pixel = ((y - 1) * size + (x - 1)) * 4; //R value
        image.data[pixel] = 0; // R
        image.data[pixel + 1] = 0; // G
        image.data[pixel + 2] = 0; // B
        image.data[pixel + 3] = 255; // A
      });
    });
    console.log(image);
    try {
      context.putImageData(image, 0, 0);
    } catch (error) {
      console.log(error);
    }
  }
  function deletePath(path) {
    let image = context.getImageData(0, 0, size, size);
    let name = path.name.split(" ");
    let i = name[1];
    pathlist[i] = null
    //pathlist = pathlist;
    path.forEach((node) => {
      console.log(node);
      let x = node.split(",");
      let y = x[1];
      x = x[0];
      let pixel = ((y - 1) * size + (x - 1)) * 4; //R value
      image.data[pixel] = 0; // R
      image.data[pixel + 1] = 0; // G
      image.data[pixel + 2] = 0; // B
      image.data[pixel + 3] = 0; // A
    });
    console.log(image);
    try {
      context.putImageData(image, 0, 0);
    } catch (error) {
      console.log(error);
    }
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
      size: size,
    };
    let response;
    try {
      response = await fetch("http://localhost:8080/dijkstra/send", {
        method: "POST",
        headers: headersList,
        body: JSON.stringify(bodyList),
      });
    } catch (error) {
      console.log(error.message);
    }
    console.log("response?");
    response = await response.json();
    console.log(response);
    response.forEach((path) => {
      console.log(path);
      path.forEach((node) => {
        let x = node.split(",");
        let y = x[1];
        x = x[0];
        // Center
        graph[4 * Number(x) + size * Number(y)] = 255;
        graph[4 * Number(x) + size * Number(y) - 1] = 0;
        graph[4 * Number(x) + size * Number(y) - 2] = 0;
        graph[4 * Number(x) + size * Number(y) - 3] = 0;

        // TOP
        graph[4 * Number(x) + size * Number(y - 1)] = 255;
        graph[4 * Number(x) + size * Number(y - 1) - 1] = 0;
        graph[4 * Number(x) + size * Number(y - 1) - 2] = 0;
        graph[4 * Number(x) + size * Number(y - 1) - 3] = 0;

        //Bottom
        graph[4 * Number(x) + size * Number(y + 1)] = 255;
        graph[4 * Number(x) + size * Number(y + 1) - 1] = 0;
        graph[4 * Number(x) + size * Number(y + 1) - 2] = 0;
        graph[4 * Number(x) + size * Number(y + 1) - 3] = 0;

        //left
        graph[4 * Number(x - 1) + size * Number(y)] = 255;
        graph[4 * Number(x - 1) + size * Number(y) - 1] = 0;
        graph[4 * Number(x - 1) + size * Number(y) - 2] = 0;
        graph[4 * Number(x - 1) + size * Number(y) - 3] = 0;

        //right
        graph[4 * Number(x + 1) + size * Number(y)] = 255;
        graph[4 * Number(x + 1) + size * Number(y) - 1] = 0;
        graph[4 * Number(x + 1) + size * Number(y) - 2] = 0;
        graph[4 * Number(x + 1) + size * Number(y) - 3] = 0;
        //console.log(4 * Number(x) + size * (Number(y) - 1) - 3);
      });
    });
    //console.log(graph);
    putImageData(response);
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
      color = "#FFAACCFF";
      context.arc(x1, y1, 50, 0, 2 * Math.PI);
      context.stroke();
      context.closePath();
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

<div id="map-container">
  <div id="ui">
    <div id="paths">
      {pathlist};
      {#each pathlist as path}
        <li
          style="background-color: rgba(0, 37, 50, 0.3); padding: 5;"
          on:mouseenter={() => {
            console.log(path.name);
          }}
          on:mouseleave={console.log("focus")}
        >
          {path.name} <button>delete</button>
        </li>
        <!-- add delete function-->
      {/each}
    </div>
  </div>
  <div
    id="canvas-container"
    style="background-image: url({mapImage});
  background-size: contain;
  background-repeat: no-repeat;"
  >
    <canvas
      style="opacity: 0.5;"
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
  </div>
  <div id="bottom-row">
    <input type="text" bind:value={lineWidth} />
    <button on:click={getImageData}>HELLO</button>
    <button
      on:click={() => {
        color = "#FF0000FF";
      }}>RED</button
    >
    <button
      on:click={() => {
        color = "#0000FFFF";
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
</div>

<style>
  #map-container {
    width: 100%;
    min-width: 80vw;
    display: grid;
    grid-template-columns: 1fr 9fr;
  }
  #bottom-row {
    background-color: rgba(83, 116, 145, 0.545);
    grid-column: 1 / span 2;
  }
  #ui {
    grid-row: 1 / span 2;
    background-color: gray;
  }
  #paths {
    display: grid;
    grid-template-columns: 1fr;
  }
  #canvas-container {
    width: 100%;
    height: 100%;
  }
</style>
