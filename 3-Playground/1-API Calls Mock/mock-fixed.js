/**version 8 - Fixed */
import fetch from "node-fetch";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { RateLimit } from "async-sema";

let asyncCalls = 0;
let totalResponses = 0;
let outer = 1;
let inner = 5_000;
const totalCalls = inner * outer;
const file = createWriteStream("file.json");
const inStream = new Readable({ read() {} });
inStream.push("[");

file
  .on("drain", () => {
    inStream.resume();
    console.log(`Write stream buffer drained...`);
  })
  .on("error", () => console.log(`write error`))
  .on("close", () => {
    console.log(`write close`);
    process.exit();
  })
  .on("finish", () => console.log(`write finish`));

inStream
  .on("error", () => console.log(`read error`))
  .on("close", () => console.log(`read close`))
  .on("end", () => console.log(`read end`));

inStream.pipe(file);

function manageErrors(response) {
  if (!response.ok) {
    const responseError = {
      statusText: response.statusText,
      status: response.status,
    };
    throw responseError;
  }
  return response.json();
}

async function sendRequest(id) {
  asyncCalls++;
  const callback = (json) => {
    asyncCalls--;
    if (totalResponses === totalCalls && asyncCalls === 0) {
      inStream.push(JSON.stringify(json) + "]");
      waitUntilFinishWriting();
    } else {
      if (!inStream.push(JSON.stringify(json) + ",")) {
        inStream.pause();
      }
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);
  const options = { signal: controller.signal };
  totalResponses++;
  await fetch(`https://jsonplaceholder.typicode.com/photos/${id}`, options)
    .then(manageErrors) // call function to handle errors
    .then(callback)
    .catch(function (error) {
      asyncCalls--;
      if (totalResponses === totalCalls && asyncCalls === 0) {
        inStream.push(JSON.stringify(error) + "]");
        waitUntilFinishWriting();
      } else {
        if (!inStream.push(JSON.stringify(error) + ",")) {
          inStream.pause();
        }
      }
    });
  clearTimeout(timeoutId);
}

async function waitUntilFinishWriting() {
  console.log(`waitUntilFinishWriting`);
  console.log(file.writableLength);
  if (file.writableLength > 0) {
    await new Promise((res, rej) => {
      setTimeout(waitUntilFinishWriting, 1000);
    });
  } else {
    inStream.destroy(); //Invoked "close" event handler
    file.destroy(); //Invoked "close" event handler
  }
}

const limit = RateLimit(5);
(async () => {
  for (let i = 1; i <= outer; i++) {
    for (let j = 1; j <= inner; j++) {
      // if (asyncCalls > 5) {
      //   const timeout = await new Promise((res, rej) => {
      //     setTimeout(() => res(`Keep sending...`), 1_000);
      //   });
      //   // console.log(timeout);
      // }
      await limit();
      console.log(j)
      sendRequest(j);
    }
    console.log(`round ${i}`);
  }
})();
