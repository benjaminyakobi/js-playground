/**Concurrency in JavaScript
 * https://gist.github.com/montanaflynn/cb349fd109b561c35d6c8500471cdb39
 */

// send the request with a request-id header read the body
// simulated delays in responses between .3 and .6 seconds
function sendRequest(requestID, cb) {
  var delay = Math.floor(Math.random() * (6 - 3 + 1)) + 5;
  var request = {
    hostname: "httpbin.org",
    headers: { "request-id": requestID },
    path: "/delay/." + delay,
  };
  require("http")
    .get(request, (res) => {
      var body = "";
      res.on("data", function (chunk) {
        body += chunk;
      });
      res.on("error", (err) => console.error("errorrrrr", err));
      res.on("end", function () {
        cb(res, body);
      });
    })
    .end();
}

// CONCURRENT REQUESTS
// Default by nature of js
concurrentRequests(5);
function concurrentRequests(limit) {
  for (var i = 0; i < limit; i++) {
    sendRequest(i, function (res, body) {
      var reqID = JSON.parse(body).headers["Request-Id"];
      var sCode = res.statusCode;
      console.log("Concurrent Response #" + reqID + " returned a " + sCode);
    });
  }
}

// SEQUENTIAL REQUESTS
// Have to try a little bit
sequentialRequests(5);
function sequentialRequests(count, i) {
  if (i == undefined) {
    i = 0;
  }
  if (i++ >= count) {
    return;
  }
  sendRequest(i, function (res, body) {
    var reqID = JSON.parse(body).headers["Request-Id"];
    var sCode = res.statusCode;
    console.log("Sequential Response #" + reqID + " returned a " + sCode);
    sequentialRequests(count, i);
  });
}

// PARALLEL REQUESTS
// pretty complex and for not much gain
// parallizedRequests(5);
// function parallizedRequests(count) {
//   var cluster = require("cluster");
//   var count = count;
//   if (cluster.isMaster) {
//     for (var i = 0; i < count; i++) {
//       var worker = cluster.fork();
//       worker.on("message", function (message) {
//         console.log(message.data.result);
//       });
//     }
//     var i = 0;
//     for (var wid in cluster.workers) {
//       i++;
//       if (i > count) {
//         return;
//       }
//       cluster.workers[wid].send({
//         type: "request",
//         data: {
//           number: i,
//         },
//       });
//     }
//   } else {
//     process.on("message", function (message) {
//       if (message.type === "request") {
//         sendRequest(message.data.number, function (res, body) {
//           var reqID = JSON.parse(body).headers["Request-Id"];
//           var sCode = res.statusCode;
//           process.send({
//             data: {
//               result: "Parallel Response #" + reqID + " returned a " + sCode,
//             },
//           });
//           process.exit(0);
//         });
//       }
//     });
//   }
// }
