/** Resources:
 * https://splunktool.com/how-to-parse-a-large-newlinedelimited-json-file-by-jsonstream-module-in-nodejs
 */
import { createReadStream } from "fs";
import { parse } from "JSONStream";

const stream = createReadStream("../3-Winston/logs/error.log", {
  flags: "r",
  encoding: "utf-8",
  autoClose: true,
});
const parser = parse("*");

stream.pipe(parser);

parser.on("data", function (obj) {
  console.log(obj); // Process each JSON object
});

parser.on("end", function () {
  console.log("Parser end event");
});

parser.on("error", function (err) {
  console.error(`Parser err: ${err}`);
});

parser.on("close", function (err) {
  console.log("Parser close event");
});

stream.on("end", function () {
  console.log("Reader end event");
});
stream.on("close", function (err) {
  console.log("Reader close event");
});
stream.on("error", function (err) {
  console.error(`Reader err: ${err}`);
});