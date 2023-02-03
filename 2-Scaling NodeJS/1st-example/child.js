process.on("message", (msg) => {
  console.log("Message from parent:", msg);
});

let counter = 0;

setInterval(() => {
  process.send({ pid: process.pid, val: counter++ }); //Send back fetched data
}, 1000);
