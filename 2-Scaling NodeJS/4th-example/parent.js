import { Worker } from "worker_threads";

const worker1 = new Worker("./child.js");
worker1.postMessage("Hello child1!");

const worker2 = new Worker("./child.js");
worker2.postMessage("Hello child2!");

worker1.on("message", (msg) => {
  console.log(msg, "from worker 1");
});

worker2.on("message", (msg) => {
  console.log(msg, "from worker 2");
});
