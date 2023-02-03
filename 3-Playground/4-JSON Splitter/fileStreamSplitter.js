/**
 * https://medium.com/@vatsav.gs/chunking-and-file-writing-in-node-js-file-streams-34f777ff419e
 * https://gist.github.com/srivatsav/37e5ce7d76f12413b2c8743d07b591ac#file-file-stream-splitter-js
 */
import { createWriteStream, createReadStream } from "fs";

const splitFileReadStream = (readStream, maxFileSize, filePath, callback) => {
  if (maxFileSize <= 0) {
    throw new Error("Invlaid file size.");
  }

  const fileChunks = [];

  const outputStream = (splitOffset) => {
    let fileSplitPath = generateFilePath(filePath, splitOffset);
    return createWriteStream(fileSplitPath);
  };
  splitStream(outputStream, readStream, maxFileSize, (error, writeStreams) => {
    writeStreams.forEach((writeStream) => fileChunks.push(writeStream["path"]));
    callback(error, fileChunks);
  });
};

const splitStream = (outputStream, fileStream, maxFileSize, callback) => {
  let chunkNumber = 0;
  let currentFileSize = 0;
  let currentOutputWriteStream;
  let noOfStreamsWritten = 0;
  let fileStreamStart = false;
  let fileStreamEnd = false;
  let error = null;
  const outputStreams = [];
  const { highWaterMark: defaultChunkSize } = fileStream._readableState;

  fileStream.on("readable", () => {
    let fileChunk;

    while (
      (fileChunk = fileStream.read(
        Math.min(maxFileSize - currentFileSize, defaultChunkSize)
      )) !== null
    ) {
      if (!fileStreamStart) {
        createChunkOutPutWriteStream();
        fileStreamStart = true;
      }

      if (fileChunk.length > maxFileSize) {
        throw new Error("Failed chunking FILE into given maxFileSize.");
      }

      currentOutputWriteStream.write(fileChunk);
      currentFileSize += fileChunk.length;

      if (currentFileSize == maxFileSize) {
        endChunkWriteStream();
      }
    }
  });

  // creating output stream for each individual chunk in a file partition.
  const createChunkOutPutWriteStream = () => {
    currentOutputWriteStream = outputStream(chunkNumber); // returns a write stream for the file chunk.
    currentOutputWriteStream.on("finish", () => {
      noOfStreamsWritten++;
      if (fileStreamEnd && noOfStreamsWritten == chunkNumber) {
        callback(error, outputStreams);
      }
    });
    outputStreams.push(currentOutputWriteStream);
    chunkNumber++;
  };

  const endChunkWriteStream = () => {
    currentOutputWriteStream.end();
    currentOutputWriteStream = null;
    currentFileSize = 0;
    fileStreamStart = false;
  };

  fileStream.on("end", () => {
    if (currentOutputWriteStream) endChunkWriteStream();
    fileStreamEnd = true;
  });
};

const generateFilePath = (baseName, n) => {
  return `${baseName}-split-${n}.json`;
};

export default {
  splitFileReadStream,
};

function callme(error, data){
  if(error) console.log(error);
  console.log(data)
}

const stream = createReadStream("./Original/original.json", {
  flags: "r",
  encoding: "utf-8",
  autoClose: true,
});

splitFileReadStream(stream, 1024*1024, "./Originaloriginal", callme);
