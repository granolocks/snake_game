// async function init() {
//   const res = await fetch('addTwo.wasm');
//   const buffer = await res.arrayBuffer()
//   const wasm = await WebAssembly.instantiate(buffer);
//   const { addTwo } = wasm.instance.exports;
//   console.log(addTwo(100, 200));
// }

// init();

import init, { World, Direction } from "snake_game";

import { rand } from "./utils/random.js";

init().then((wasm) => {
  const CELL_SIZE = 30;
  const WORLD_WIDTH = 16;
  const spawnIdx = rand(WORLD_WIDTH * WORLD_WIDTH);
  const world = World.new(WORLD_WIDTH, spawnIdx);
  const worldWidth = world.width();
  const canvas = <HTMLCanvasElement>document.getElementById("snake-canvas");
  const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
  const canvasWidth = worldWidth * CELL_SIZE;
  canvas.height = canvasWidth;
  canvas.width = canvasWidth;

  document.addEventListener("keydown", ({ code }) => {
    if (code === "ArrowUp" || code === "KeyW") {
      world.change_snake_direction(Direction.Up);
    } else if (code === "ArrowRight" || code === "KeyD") {
      world.change_snake_direction(Direction.Right);
    } else if (code === "ArrowDown" || code === "KeyS") {
      world.change_snake_direction(Direction.Down);
    } else if (code === "ArrowLeft" || code === "KeyA") {
      world.change_snake_direction(Direction.Left);
    }
  });

  function drawSnake() {
    const snakeCells = new Uint32Array(
      wasm.memory.buffer,
      world.snake_cells(),
      world.snake_length()
    );

    snakeCells.forEach(drawBodyCell);
  }

  function drawRewardCell() {
    drawCell(world.reward_cell(), "red");
  }

  function drawBodyCell(cellIndex: number, bodyIndex: number) {
    const color = bodyIndex === 0 ? "lightseagreen" : "darkseagreen";
    drawCell(cellIndex, color);
  }

  function drawCell(cellIndex: number, color: string) {
    const x = cellIndex % worldWidth;
    const y = Math.floor(cellIndex / worldWidth);

    ctx.beginPath();
    ctx.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
  }

  function drawWorld() {
    ctx.beginPath();

    for (let x = 0; x < worldWidth + 1; x++) {
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, canvasWidth);
    }

    for (let y = 0; y < worldWidth + 1; y++) {
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(canvasWidth, y * CELL_SIZE);
    }

    ctx.strokeStyle = "lightskyblue";
    ctx.stroke();
  }

  function paint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWorld();
    drawSnake();
    drawRewardCell();
  }

  function update() {
    const fps = 10;
    setTimeout(() => {
      world.step();
      paint();
      requestAnimationFrame(update);
    }, 1000 / fps);
  }

  paint();
  update();
});
