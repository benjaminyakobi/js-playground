import { fork } from "child_process";

const child1 = fork("child.js"); //fork child process
const child2 = fork("child.js"); //fork child process

child1.on("message", (msg) => {
  console.log("Message from child", msg); //Push data to results array
});

child2.on("message", (msg) => {
  console.log("Message from child", msg); //Push data to results array
});

child1.send("Hello Child-1"); //Send sub-array to fetch data
child2.send("Hello Child-2"); //Send sub-array to fetch data

setInterval(() => {
  // console.log(child1.connected)
  child1.disconnect(); //disconnect child from parent
  // console.log(child1.connected)
  child2.disconnect(); //disconnect child from parent
  process.exit(); //exit parent process
}, 5000);
