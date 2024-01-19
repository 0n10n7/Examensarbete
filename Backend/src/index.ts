import { Elysia } from "elysia";

const server = new Elysia();
server.listen(8080);
console.log("Elysia listening on 8080");