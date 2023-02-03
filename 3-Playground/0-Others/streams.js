/**https://gist.github.com/rajat1saxena/72cd3d0cd5801b9f0e2ef3afc0ac06e3 */
/**https://stackoverflow.com/questions/18932488/how-to-use-drain-event-of-stream-writable-in-node-js */

// this program will result in an "JavaScript heap out of memory"
import { createWriteStream } from "fs";

const printer = function () {
  const fil = createWriteStream("file");
  let i = 0;
  const MAX_LIM = 1e6;

  const writer = function () {
    let result = true;

    // Write to file until we get false as fil.write()'s
    // result
    while (i < MAX_LIM && result) {
      result = fil.write(`Hello man: ${i}\n`);

      // even if the result is false, our write has been probably
      // written to the buffer. A false value denotes that the our last
      // write has resulted in buffered data, crossing the highWaterMark.
      // So, we have to increment the count.
      i += 1;
      console.log(result)
    }

    // Add an event listener if the last write was not
    // successful
    if (i < MAX_LIM) {
      fil.once("drain", writer);
      console.log("DRAIN")
    }
  };

  return writer;
};

const printty = printer();
printty();
