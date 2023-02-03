// CONCURRENT REQUESTS
var http = require('http')

function concurrentRequests(){
  for (var i = 0; i < 5; i++) {
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
          console.log(JSON.parse(body).headers['Request-Id'])
        })
    }).end()
  }
}

console.log("Running concurrent requests!")
concurrentRequests()
