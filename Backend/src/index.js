import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import mongoose from "mongoose";

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
server.use(cors());

let graphs = [];
server.get('/', async ({ set }) => {
    set.status = 400;
    return set.status = 200;
})

server.post("/generate", ({ set, body }) => {
    set.status = 400;
    let graph = new WeightedGraph();
    graphs.push(fillOutGraph(body.size, graph));
    return set.status = 200;
});
server.post("/dijkstra/send", ({ set, body }) => {
    set.status = 400;
    console.log("received");
    let parsedBody = JSON.parse(body);
    //Need to implement a way to find the correct graph when there are multiple users
    if (graphs[0]) {
        let time = Date.now();
        console.log(parsedBody.cities);
        console.log("size", parsedBody.size);
        let paths = [];
        let j = 0;
        for (let i = 0; i <= parsedBody.size * parsedBody.size * 4; i += 4) {
            if ((i / 4) % parsedBody.size == 0) {
                j++;
                console.log(j);
            }
            // parsedBody.graph[i] //RED VALUE
            // parsedBody.graph[i+1] //GREEN VALUE
            // parsedBody.graph[i+2] //BLUE VALUE
            //parsedBody.graph[i+3] //ALPHA VALUE
            switch (parsedBody.graph[i + 3]) {
                case 0:
                    break;
            
                default:
                    graphs[0].changeVertex(`${(i / 4) % parsedBody.size},${j}`, (parsedBody.graph[i]*parsedBody.RWeight)+ (parsedBody.graph[i+1]*parsedBody.GWeight) + (parsedBody.graph[i+2]*parsedBody.BWeight));
                    break;
            }
           

            //let color = `${parsedBody.graph[i]},${parsedBody.graph[i + 1]},${parsedBody.graph[i + 2]},${parsedBody.graph[i + 3]}`;
            // switch (color) {
            //     case "255,0,0,255": //RED
            //         graphs[0].changeVertex(`${(i / 4) % parsedBody.size},${j}`, 100);
            //         break;
            //     case "0,255,0,255": //GREEN
            //         graphs[0].changeVertex(`${(i / 4) % parsedBody.size},${j}`, 1000);
            //         break;
            //     case "0,0,255,255": //BLUE
            //         graphs[0].changeVertex(`${(i / 4) % parsedBody.size},${j}`, 10000);
            //         break;
            //     case "0,0,0,255": //BLACK
            //         graphs[0].changeVertex(`${(i / 4) % parsedBody.size},${j}`, 5);
            //         break;
            //     default:
            //         break;
            // }
        }
        console.log(`parsing took ${(Date.now() - time)} milliseconds to parse`);
        console.log(parsedBody.cities);
        for (let i = 0; i < parsedBody.cities.length; i++) {
            for (let j = i; j < parsedBody.cities.length; j++) {
                if (i != j) {
                    paths.push(graphs[0].Dijkstra(parsedBody.cities[i], parsedBody.cities[j]));
                }
            }
            //Make all cities connected to all cities. Make the path between cities have lowered weight.

        }
        console.log("PATHS.", paths);
        set.status = 200;
        return JSON.stringify(paths);
    }
    return ("Generate the graph first");
})

server.listen(8080);
console.log("Elysia listening on 8080");

function fillOutGraph(size, graph) {
    let time = Date.now();
    for (let i = -1; i <= size; i++) {
        for (let j = -1; j <= size; j++) {
            graph.addVertex(`${i},${j}`);
        }
    }
    console.log(`graph took ${(Date.now() - time)} milliseconds to add vertexes`)
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
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
    console.log(`graph took ${(Date.now() - time)} milliseconds to populate ${size * size} nodes`);
    graph.changeVertex("2,1", 10000);
    console.log(graph.Dijkstra(`1,1`, `9,8`));
    return graph;
}

// let graph = new WeightedGraph();
// graph = fillOutGraph(2000, graph);

// for (let i = 2; i <= 5; i++) {
//     graph.changeVertex(`${3},${i}`, 100)
// }

// console.log(graph.Dijkstra(`1,2`, `4,2`));