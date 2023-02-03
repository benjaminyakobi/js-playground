/**
 * Problem

 when Node.js server is handling intensive CPU task, other non-intensive HTTP request will get affected as well. To resolve this, we can use child_process module to handling it by multiprocessing
 */

import express from "express";
const app = express();

//http://localhost:5000/normal
app.get("/normal", async (req, res) => {
  res.send(`normal request`);
});

//http://localhost:5000/slow?number=35
app.get("/slow", (req, res) => {
  const startTime = new Date();
  const result = mySlowFunction(req.query.number);
  const endTime = new Date();
  res.json({
    result,
    time: endTime.getTime() - startTime.getTime() + "ms",
  });
});

function mySlowFunction(baseNumber) {
  let result = 0;
  for (let i = Math.pow(baseNumber, 5); i >= 0; i--) {
    result += Math.atan(i) * Math.tan(i);
  }
  return result;
}

app.listen(process.env.PORT || 5000, () =>
  console.log("server is running at port 5000")
);

/**
 * https://jeffdevslife.com/p/scaling-node.js-application-with-multiprocessing/
  
 Javascript is a single threaded language. This means it has one call stack and one memory heap and it will executes code in order and must finish executing a piece code before moving onto the next. It will become a problem when the application slowly scaled up. As a result, we could use the child_process to provide multiprocessing on handling CPU-Intensive Tasks.

 As we mentioned above Javascript is single threaded and it will executes the code in sequence order. Here will be the problem when user trying to access two HTTP requests which one of it is handling CPU intensive task
 */
