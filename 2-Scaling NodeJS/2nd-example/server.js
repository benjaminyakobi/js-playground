import { createServer } from "http";
import { fork } from "child_process";

const server = createServer();

server.on("request", (req, res) => {
  if (req.url === "/compute") {
    const compute = fork("compute.js");
    compute.send("start");
    compute.on("message", (sum) => {
      res.end(`Sum is ${sum}`);
    });
  } else {
    res.end("Ok");
  }
});

server.listen(3000);

/** 
 * https://www.freecodecamp.org/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
 
 When a request to /compute happens now with the above code, we simply send a message to the forked process to start executing the long operation. The main process’s event loop will not be blocked.

Once the forked process is done with that long operation, it can send its result back to the parent process using process.send.

In the parent process, we listen to the message event on the forked child process itself. When we get that event, we’ll have a sum value ready for us to send to the requesting user over http.

The code above is, of course, limited by the number of processes we can fork, but when we execute it and request the long computation endpoint over http, the main server is not blocked at all and can take further requests.
 */
