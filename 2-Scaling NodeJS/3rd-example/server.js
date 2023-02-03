import express from "express";
const app = express();
import { fork } from "child_process";

//http://localhost:5000/normal
app.get("/normal", async (req, res) => {
  res.send(`normal request`);
});

//http://localhost:5000/forkProcess?number=35
app.get("/forkProcess", (req, res) => {
  const startTime = new Date();
  const child = fork("./compute"); //access the module path in fork method
  child.send({ number: parseInt(req.query.number) }); //pass custom variable into the particular file

  //Execute the following code when the child response has responded back
  child.on("message", (result) => {
    const endTime = new Date();
    res.json({
      result,
      time: endTime.getTime() - startTime.getTime() + "ms",
    });
  });
});

app.listen(process.env.PORT || 5000, () =>
  console.log("server is running at port 5000")
);

/**
fork method takes in 3 arguments: fork(<path to module>,<array of arguments>, <optionsObject>)
The child_process.fork() method able to spawn new Node.js processes. It allow an additional communication channel built-in that allows messages to be passed back and forth between the parent and child by using process.send and process.on. So the parent process won’t be blocked and can continue responding to requests.

server.js:
1. Import the fork method from child process
2. Passing the file path into the fork method argument
3. Send custom variable into separated nodejs process (forked) by using process.send
4. Respond back to the HTTP request after receiving the child process response by process.on

compute.js:
1. Relocate the high intensive CPU task code into separate file
2. Execute the high intensive code when receiving the signal/ message from parent process by using process.on and return once the task is finised by using process.send()
 */
