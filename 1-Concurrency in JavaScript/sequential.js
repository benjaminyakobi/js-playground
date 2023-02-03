// SEQUENTIAL REQUESTS
import { get } from 'http'

function sequentialRequest(count){
  if (count == undefined) {count = 0}
  count++
  if (count > 5) {return}
    var request = {
      hostname: 'httpbin.org',
      headers: {'request-id': count},
      path: '/delay/.'+  Math.floor(Math.random() * (5 - 1 + 1)) + 1
    }
    get(request, (res) => {
        var body = ''
        res.on('data', function (chunk) {
          body += chunk
        })
        res.on('end', function () {
          console.log(JSON.parse(body).headers['Request-Id'])
          sequentialRequest(count)
        })
    }).end()
}

console.log("Running sequential requests!")
sequentialRequest()

