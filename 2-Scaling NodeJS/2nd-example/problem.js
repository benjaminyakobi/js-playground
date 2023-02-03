const http = require("http");

const longComputation = () => {
  let sum = 0;
  for (let i = 0; i < 1e9; i++) {
    sum += i;
  }
  return sum;
};

const server = http.createServer();

server.on("request", (req, res) => {
  if (req.url === "/compute") {
    const sum = longComputation();
    return res.end(`Sum is ${sum}`);
  } else {
    res.end("Ok");
  }
});

server.listen(3000);

/**
 * https://www.freecodecamp.org/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
 
Let’s say we have an http server that handles two endpoints. One of these endpoints (/compute below) is computationally expensive and will take a few seconds to complete. We can use a long for loop to simulate that.

This program has a big problem; when the the /compute endpoint is requested, the server will not be able to handle any other requests because the event loop is busy with the long for loop operation.

There are a few ways with which we can solve this problem depending on the nature of the long operation but one solution that works for all operations is to just move the computational operation into another process using fork.

We first move the whole longComputation function into its own file and make it invoke that function when instructed via a message from the main process.

look at server.js & compute.js
 */
