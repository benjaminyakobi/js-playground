import { parentPort } from "worker_threads";

let counter = 0;
setInterval(() => {
  parentPort.postMessage(`${counter++}`);
}, 1000);

parentPort.on("message", (msg) => {
  console.log(msg);
});
