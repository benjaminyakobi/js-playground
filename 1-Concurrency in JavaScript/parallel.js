// PARALLEL REQUESTS
// pretty complex and for not much gain
var http = require('http')
var cluster = require('cluster')

function getResponse(i, cb){
  var request = {
    hostname: 'httpbin.org',
    headers: {'request-id': i},
    path: '/delay/.'+  Math.floor(Math.random() * (5 - 1 + 1)) + 1
  }
  http.get(request, (res) => {
      var body = ''
      res.on('data', function (chunk) {
        body += chunk
      })
      res.on('end', function () {
        cb(JSON.parse(body).headers['Request-Id'])
      })
  }).end()
}

if(cluster.isMaster) {
  console.log("Running concurrent requests!")
  var numWorkers = require('os').cpus().length;
  for(var i = 0; i < 5; i++) {
    var worker = cluster.fork()
    worker.on('message', function(message) {
      console.log(message.data.result)
    })
  }
  var count = 0
  for(var wid in cluster.workers) {
    count++
    if (count > 5) {return}
    cluster.workers[wid].send({
      type: 'request',
      data: {
        number: count
      }
    })
  }
} else {
  process.on('message', function(message) {
    if(message.type === 'request') {
      getResponse(message.data.number, function(res){
        process.send({
          data: {
            result: res
          }
        })
        process.exit(0)
      })
    }
  })
}