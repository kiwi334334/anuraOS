import express, { Request, Response } from "express";
import createServer from '@tomphttp/bare-server-node';

import read from "fs-readdir-recursive";
import path from "path"

import { spawn } from "child_process";


spawn("node", ["index.js"], {
  cwd: "../wsproxy/",
  env: {
    "PORT": "8001"
  },
  stdio: [process.stdout, process.stderr]
})

spawn("docker rm relay; docker run --privileged -p 8002:80 --name relay benjamincburns/jor1k-relay:latest", [], {
  shell: true,
  stdio: [process.stdout, null, process.stderr],
})

let files = read('public');

const app = express();
const port = 8000;
const bare = createServer('/bare/');

__dirname = path.join(process.cwd(), '..');

app.get("/", (req: Request, res: Response) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("Cross-Origin-Resource-Policy", "same-site");
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/anura-filestocache", (req: Request, res: Response) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("Cross-Origin-Resource-Policy", "same-site");

  res.contentType("application/json");
  res.send(JSON.stringify(files));
});

app.use(async (req: Request, res: Response, next: Function) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("Cross-Origin-Resource-Policy", "same-site");

  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
    return;
  }
  next();
})

app.use(async (req: Request, res: Response, next: Function) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("Cross-Origin-Resource-Policy", "same-site");

  if (req.path.startsWith(__dirname + "/public")) {
    res.sendFile(req.path);
    return;
  }

  next();
});

app.use(async (req: Request, res: Response, next: Function) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("Cross-Origin-Resource-Policy", "same-site");

  if (req.path.startsWith(__dirname + "/aboutproxy/static")) {
    res.sendFile(req.path);
    return;
  }

  next();
});

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/build"));
app.use("/apps", express.static(__dirname + "/apps"));
app.use(express.static(__dirname + "/aboutproxy/static"));


app.listen(port, () => console.log("Listening on port: ", port));
