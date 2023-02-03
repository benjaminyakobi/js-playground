import { Worker } from "worker_threads";

function runService(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./child.js", { workerData });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

async function run() {
  console.log("Running...");
  const result = await runService("world");
  console.log(result);
}

run().catch((err) => console.error(err));
console.log("Waiting...");
