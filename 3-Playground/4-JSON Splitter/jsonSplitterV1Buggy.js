import {
  createReadStream,
  createWriteStream,
  statSync,
  existsSync,
  read,
} from "fs";
import { parse } from "JSONStream";
import { Readable } from "stream";

const parser = parse("*");
const stream = createReadStream("./Original/original.json", {
  flags: "r",
  encoding: "utf-8",
  autoClose: true,
});
stream.pipe(parser);
var count = 0;
var objCount = 0;
var writeStream = createWriteStream(
  `./Original/splitted/${count}_splitted.json`,
  { highWaterMark: 128 * 1024 }
);
var readStream = new Readable({ read() {} });
// readStream.push("[{}");
readStream.pipe(writeStream);

parser
.on("data", async function (obj) {
  if (!existsSync(`./Original/splitted/${count}_splitted.json`)) {
      if(obj.id === "2489673744") console.log(obj.id)
      readStream = new Readable({ read() {} });
      readStream
        .on("error", (err) => console.log(`read error: ${err}`))
        .on("close", () => console.log(`read close`))
        .on("end", () => console.log(`read end`));
      writeStream = createWriteStream(
        `./Original/splitted/${count}_splitted.json`,
        { highWaterMark: 128 * 1024 }
      );
      writeStream
        .on("error", (err) => console.log(`write error: ${err}`))
        .on("close", () => console.log(`write close`))
        .on("finish", () => console.log(`write finish`));
      readStream.pipe(writeStream);
      objCount = 0;
      // readStream.push("[" + JSON.stringify(obj));
    } 
    else {
      try {
        // readStream.push("," + JSON.stringify(obj));
        if (objCount === 0) {
          readStream.push("[" + JSON.stringify(obj));
          objCount++;
          console.log(objCount);
        } else {
          readStream.push("," + JSON.stringify(obj));
        }
        if (
          statSync(`./Original/splitted/${count}_splitted.json`).size >=
          1024 * 1024 * 20
        ) {
          stream.pause();
          parser.pause();
          readStream.push("]");
          console.log(readStream.readableLength, writeStream.writableLength);
          while (readStream.readableLength || writeStream.writableLength) {
            await new Promise((resolve) => setTimeout(resolve, 1));
            console.log(readStream.readableLength, writeStream.writableLength);
          }
          count++;
          parser.resume();
          stream.resume();
        }
      } catch (err) {
        console.log(
          `./Original/splitted/${count}_splitted.json already exists`
        );
        count++;
      }
    }
  })
  .on("end", async function () {
    console.log("Parser end event");
    readStream.push("]");
  })
  .on("error", function (err) {
    console.error(`Parser err: ${err}`);
  })
  .on("close", async function (err) {
    console.log("Parser close event");
  });

stream
  .on("end", function () {
    console.log("Reader end event");
  })
  .on("close", function (err) {
    console.log("Reader close event");
  })
  .on("error", function (err) {
    console.error(`Reader err: ${err}`);
  });
