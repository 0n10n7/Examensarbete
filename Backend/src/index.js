import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import mongoose, { now } from "mongoose";

import { UserDB } from "./schemas/users.js";

import { WeightedGraph } from "./dijkstra.js"

const dbURI = `mongodb+srv://garrattkarl:${process.env.DB_PASSWORD}@cluster0.ar0kjrf.mongodb.net/?retryWrites=true&w=majority`;

try {
    await mongoose.connect(dbURI);
    console.log("Connected to database ...");
} catch (error) {
    console.log(`Could not connect to database: ${error.message}`);
}

const server = new Elysia();
server.listen(8080);
console.log("Elysia listening on 8080");

let graph = new WeightedGraph();
function fillOutGraph(size) {
    let time = Date.now();
    for (let i = 0; i <= size + 1; i++) {
        for (let j = 0; j <= size + 1; j++) {
            graph.addVertex(`${i},${j}`);
        }
    }
    console.log(`graph took ${(Date.now() - time)} milliseconds to add vertexes`)
    for (let i = 1; i <= size; i++) {
        for (let j = 1; j <= size; j++) {
            //console.log(JSON.stringify(i)+JSON.stringify(j));
            graph.addEdge(`${i},${j}`, `${i},${j - 1}`, 10);//UP
            graph.addEdge(`${i},${j}`, `${i},${j + 1}`, 10);//DOWN
            graph.addEdge(`${i},${j}`, `${i - 1},${j}`, 10);//LEFT
            graph.addEdge(`${i},${j}`, `${i + 1},${j}`, 10);//RIGHT

            //Diagonals
            graph.addEdge(`${i},${j}`, `${i - 1},${j - 1}`, 14);//UP-LEFT
            graph.addEdge(`${i},${j}`, `${i + 1},${j - 1}`, 14);//UP-RIGHT
            graph.addEdge(`${i},${j}`, `${i - 1},${j + 1}`, 14);//DOWN-LEFT
            graph.addEdge(`${i},${j}`, `${i + 1},${j + 1}`, 14);//DOWN-RIGHT
        }
    }
    console.log(`graph took ${(Date.now() - time)} milliseconds to populate ${size * size} nodes`)
    console.log(graph.Dijkstra(`1,1`, `9,8`));
}
fillOutGraph(2000);

for (let i = 2; i <= 5; i++) {
    graph.changeVertex(`${3},${i}`, 100)
}

console.log(graph.Dijkstra(`1,2`, `4,2`));