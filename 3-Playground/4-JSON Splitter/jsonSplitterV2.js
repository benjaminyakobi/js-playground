import { parse } from "JSONStream";
import { Readable } from "stream";
import { join } from "path";
import {
  createReadStream,
  createWriteStream,
  statSync,
  existsSync,
  readdirSync,
  readFileSync,
} from "fs";

function split(original_file, output_dir) {
  if (readdirSync(output_dir).length > 0) {
    console.log(`${output_dir} is not empty, Only empty directory is valid!`);
    return;
  }
  const WATER_MARK = { highWaterMark: 128 * 1024 };
  const FILE_SIZE = 5 * 1024 * 1024;

  const parser = parse("*");
  const stream = createReadStream(original_file, {
    flags: "r",
    encoding: "utf-8",
    autoClose: true,
  });
  stream.pipe(parser);

  var count = 0;
  var objCount = 0;
  var writeStream = createWriteStream(
    `${output_dir}/${count}_splitted.json`,
    WATER_MARK
  );
  writeStream
    .on("error", (err) => console.log(`write error: ${err}`))
    .on("close", () => console.log(`write close`))
    .on("finish", () => console.log(`write finish`));

  var readStream = new Readable({ read() {} });
  readStream
    .on("error", (err) => console.log(`read error: ${err}`))
    .on("close", () => console.log(`read close`))
    .on("end", () => console.log(`read end`));
  readStream.pipe(writeStream);

  parser
    .on("data", async function (obj) {
      try {
        if (objCount === 0) {
          readStream.push("[" + JSON.stringify(obj));
          objCount++;
        } else {
          readStream.push("," + JSON.stringify(obj));
        }

        if (
          existsSync(`${output_dir}/${count}_splitted.json`) &&
          statSync(`${output_dir}/${count}_splitted.json`).size >= FILE_SIZE
        ) {
          stream.pause();
          parser.pause();
          readStream.push("]");
          console.log(readStream.readableLength, writeStream.writableLength);
          while (readStream.readableLength || writeStream.writableLength) {
            await new Promise((resolve) => setTimeout(resolve, 1));
            console.log(readStream.readableLength, writeStream.writableLength);
          }
          readStream.unpipe(writeStream);
          readStream.destroy();
          writeStream.destroy();
          count++;
          readStream = new Readable({ read() {} });
          readStream
            .on("error", (err) => console.log(`read error: ${err}`))
            .on("close", () => console.log(`read close`))
            .on("end", () => console.log(`read end`));
          writeStream = createWriteStream(
            `${output_dir}/${count}_splitted.json`,
            WATER_MARK
          );
          writeStream
            .on("error", (err) => console.log(`write error: ${err}`))
            .on("close", () => console.log(`write close`))
            .on("finish", () => console.log(`write finish`));
          readStream.pipe(writeStream);
          objCount = 0;
          parser.resume();
          stream.resume();
        }
      } catch (err) {
        console.log(err.message);
      }
    })
    // .on("pause", function () {
    //   console.log("Parser pause event");
    // })
    // .on("resume", function () {
    //   console.log("Parser resume event");
    // })
    .on("end", function () {
      console.log("Parser end event");
      readStream.push("]");
    })
    .on("error", function (err) {
      console.error(`Parser err: ${err}`);
    })
    .on("close", function (err) {
      console.log("Parser close event");
    });

  stream
    // .on("pause", function () {
    //   console.log("Reader pause event");
    // })
    // .on("resume", function () {
    //   console.log("Reader resume event");
    // })
    .on("end", function () {
      console.log("Reader end event");
    })
    .on("close", function (err) {
      console.log("Reader close event");
    })
    .on("error", function (err) {
      console.error(`Reader err: ${err}`);
    });
}

function test(original_file, test_dir) {
  const files = readdirSync(test_dir);
  console.log(files);

  console.log(
    `========Original file keys: ${
      JSON.parse(readFileSync(original_file)).length
    }`
  );
  var totalKeys = 0;
  for (const file of files) {
    const keys = JSON.parse(readFileSync(join(test_dir, file))).length;
    console.log(file, keys);
    totalKeys += keys;
  }

  console.log(`========Total keys: ${totalKeys}`);
}

function main() {
  const original_file = "./Original/original.json";
  const output_dir = "./Original/splitted";
  split(original_file, output_dir);
  // test(original_file, output_dir);
}

main();
