https://gist.github.com/montanaflynn/cb349fd109b561c35d6c8500471cdb39
# Concurrency in JavaScript

Javascript is a programming language with a peculiar twist. Its event driven 
model means that nothing blocks and everything runs concurrently. This is not
to be confused with the same type of concurrency as running in parallel on multiple 
cores. Javascript is single threaded so each program runs on a single core yet 
every line of code executes without waiting for anything to return. This sounds
weird but it's true. If you want to have any type of sequential ordering you can
use events, callbacks, or as of late promises. 

Let's see an example:

```js
function delayedLog(index, delay){
  setTimeout(function(){ 
    console.log("Logging from function call #"+index)
  }, delay)
}

delayedLog(1, 2000)
delayedLog(2, 1000)
```

Now you might be wondering what setTimeout is doing and it's basically saying
run this function after this much time. Javascript is a Higher-order programming
language which means you can pass functions as arguments. The first delayedLog
will print to stdout after 2 seconds. The second one will print after 1 second.

What you might expect to see is:

```
// ...wait for 2 seconds
Logging from function call #1
// ...wait for 1 second
Logging from function call #2
```

But that is not the case, both will be fired at the same time one after
the other so the output would be like this:

```
// ...wait for 1 second
Logging from function call #2
// ...wait for 2 seconds
Logging from function call #1
```

The most traditional way of handling concurrency where you needed to run functions
in a certain order is known as callbacks. This is when you pass a function to a 
be run at a later time and given arguments that can be acted upon then. That is
what setTimeout is doing when you pass it a function.

```js
function log(err, msg) {
  if (err) panic(err)
  console.log(msg)
}

function doSomething(arg, callback) {
  if (isError()) callback("An error happened", null)
  setTimeout(callback(null, arg.reverse), 1000)
}
```

Now let's look at some real world examples of concurrency. We'll be making a
function that sends multiple HTTP requests, first by the function which takes
a callback and then invoking that function sequentially, concurrently and 
finally in parallel with the help of the cluster module.

For reference here is what I mean by sequential, concurrent and parallel:

- *Sequential*: do this and then do that
- *Concurrent*: do this and do that without waiting between
- *Parallel*: do this and do that at the exact same time

```js
// send the request with a request-id header read the body
// simulated delays in responses between .3 and .6 seconds
function sendRequest(requestID, cb){
  var delay = Math.floor(Math.random() * (6 - 3 + 1)) + 5
  var request = {
    hostname: 'httpbin.org',
    headers: {'request-id': requestID},
    path: '/delay/.'+  delay
  }
  require('http').get(request, (res) => {
      var body = ''
      res.on('data', function (chunk) {
        body += chunk
      })
      res.on('end', function () {
        cb(res, body)
      })
  }).end()
}

// SEQUENTIAL REQUESTS
// Have to try a little bit
sequentialRequests(5)
function sequentialRequests(count, i){
  if (i == undefined) {i = 0}
  if (i++ >= count) {return}
  sendRequest(i, function(res, body){
    var reqID = JSON.parse(body).headers['Request-Id']
    var sCode = res.statusCode
    console.log("Sequential Response #"+reqID+" returned a "+sCode)
    sequentialRequests(count, i)
  })
}

// CONCURRENT REQUESTS
// Default by nature of js
concurrentRequests(5)
function concurrentRequests(limit){
  for (var i = 0; i < limit; i++) {
    sendRequest(i, function(res, body){
      var reqID = JSON.parse(body).headers['Request-Id']
      var sCode = res.statusCode
      console.log("Concurrent Response #"+reqID+" returned a "+sCode)
    })
  }
}

// PARALLEL REQUESTS
// pretty complex and for not much gain
parallizedRequests(5)
function parallizedRequests(count){
  var cluster = require('cluster')
  var count = count
  if(cluster.isMaster) {
    for(var i = 0; i < count; i++) {
      var worker = cluster.fork()
      worker.on('message', function(message) {
        console.log(message.data.result)
      })
    }
    var i = 0
    for(var wid in cluster.workers) {
      i++
      if (i > count) {return}
      cluster.workers[wid].send({
        type: 'request',
        data: {
          number: i
        }
      })
    }
  } else {
    process.on('message', function(message) {
      if(message.type === 'request') {
        sendRequest(message.data.number, function(res,body){
          var reqID = JSON.parse(body).headers['Request-Id']
          var sCode = res.statusCode
          process.send({
            data: {
              result: "Parallel Response #"+reqID+" returned a "+sCode
            }
          })
          process.exit(0)
        })
      }
    })
  }
}
```

### Further Resources

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop
- http://bytearcher.com/articles/parallel-vs-concurrent/
- http://nickwritesablog.com/the-state-of-concurrent-javascript/
