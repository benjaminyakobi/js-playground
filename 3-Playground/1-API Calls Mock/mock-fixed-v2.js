/**version 9 - Fixed */
import fetch from "node-fetch";
import { createWriteStream } from "fs";
import { Readable } from "stream";

const file = createWriteStream("file-v2.json");
const inStream = new Readable({ read() {} });
inStream.push("{");

file
  .on("error", () => console.log(`write error`))
  .on("close", () => console.log(`write close`))
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

async function sendRequest(count) {
  console.log(count);
  if (count == undefined) count = 0;
  if (count > target) return;
  count++;
  const callback = async (json) => {
    if (count === target) {
      inStream.push(`"${count}":` + JSON.stringify(json) + "}");
      waitUntilFinishWriting();
      return;
    } else {
      inStream.push(`"${count}":` + JSON.stringify(json) + ",");
      await sendRequest(count++);
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);
  const options = { signal: controller.signal };
  await fetch(`https://jsonplaceholder.typicode.com/photos/${count}`, options)
    .then(manageErrors) // call function to handle errors
    .then(callback)
    .catch(async function (error) {
      if (count === target) {
        inStream.push(`"${count}":` + JSON.stringify(error) + "}");
        waitUntilFinishWriting();
        return;
      } else {
        inStream.push(`"${count}":` + JSON.stringify(error) + ",");
        await sendRequest(count++);
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

var target = 10;
(async () => {
    await sendRequest();
    console.log(`Second iteration...`);
})();
