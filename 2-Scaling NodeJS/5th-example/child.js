import { workerData, parentPort } from "worker_threads";

// You can do any heavy stuff here, in a synchronous way
// without blocking the "main thread"
for (let i = 0; i < 5_000_000_000; i++) {}
parentPort.postMessage({ hello: workerData });
