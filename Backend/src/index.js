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
server.use(cors);

let graphs = [];
server.post("/generate", ({ set, body }) => {
    set.status = 400;
    let graph = new WeightedGraph();
    graphs.push(fillOutGraph(body.size, graph));
    return set.status = 200;
})
server.post("/dijkstra/send", ({ set, body }) => {
    set.status = 400;
    //Need to implement a way to find the correct graph when there are multiple users
    if (graphs[0]) {
        let paths = [];
        for (let i = 0; i <= body.size * body.size; i += 4) {
            let j = 0;
            if (i % body.size === 0) {
                j++;
            }
            // body.graph[i] //RED VALUE
            // body.graph[i+1] //GREEN VALUE
            // body.graph[i+2] //BLUE VALUE
            //body.graph[i+3] //ALPHA VALUE
            let color = `${body.graph[i]}${body.graph[i + 1]}${body.graph[i + 2]}`;
            switch (color) {
                case "25500": //RED
                    graphs[0].changeVertex(`${i},${j}`, 100)
                    break;
                case "02550": //GREEN
                    graphs[0].changeVertex(`${i},${j}`, 1000)
                    break;
                case "00255": //BLUE
                    graphs[0].changeVertex(`${i},${j}`, 10000)
                    break;
                default:
                    break;
            }
        }
        for (let i = 1; i < body.cities.length; i++) {
            paths.push(graphs[0].Dijkstra(body.cities[i], body.cities[i-1]));
        }
        return paths;
    }
    return ("Generate the graph first");
})

server.listen(8080);
console.log("Elysia listening on 8080");

function fillOutGraph(size, graph) {
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
    return graph;
}

// let graph = new WeightedGraph();
// graph = fillOutGraph(2000, graph);

// for (let i = 2; i <= 5; i++) {
//     graph.changeVertex(`${3},${i}`, 100)
// }

// console.log(graph.Dijkstra(`1,2`, `4,2`));