/**version 1 */
// import fetch from "node-fetch";
// import { createWriteStream } from "fs";

// const file = createWriteStream("json-file");

// let asyncCalls = 0;
// function wrapper() {
//   let ok = true;
//   const printer = function (json) {
//     if (ok) {
//       ok = file.write(json);
//     //   console.log(`WRITE: ${ok}`);
//     }
//     if (!ok) {
//     //   console.log(`=========DRAIN THE STREAM=========`);
//       file.once("drain", wrapper);
//     }
//   };
//   return printer;
// }

// function sendRequest(id) {
//   let printty = wrapper();

//   const callback = (json) => {
//     if (--asyncCalls === 0) {
//       printty(JSON.stringify(json) + "]");
//     } else {
//       printty(JSON.stringify(json) + ",");
//     }
//   };

//   asyncCalls++;
//   fetch(`https://jsonplaceholder.typicode.com/photos/${id}`)
//     .then((response) => response.json())
//     .then(callback)
//     .catch(callback);
// }
// file.write("[");
// for (let i = 0; i < 5000; i++) {
//   sendRequest(i);
// }

// /**version 2 */
// import fetch from "node-fetch";
// import { createWriteStream } from "fs";

// let asyncCalls = 0;

// const file = createWriteStream("file.json");
// const printer = function (json) {
//   let ok = file.write(json);
//   if (!ok) {
//     console.log(`=========DRAIN THE STREAM=========`);
//     file.once("drain", () => (ok = true));
//   }
// };

// function sendRequest(id) {
//   const callback = (json) => {
//     if (--asyncCalls === 0) {
//       printer(JSON.stringify(json) + "]");
//     } else {
//       printer(JSON.stringify(json) + ",");
//     }
//   };

//   asyncCalls++;
//   fetch(`https://jsonplaceholder.typicode.com/photos/${id}`)
//     .then((response) => response.json())
//     .then(callback)
//     .catch(callback);
// }
// file.write("[");
// for (let i = 0; i < 5000; i++) {
//   sendRequest(i);
// }

/**version 2 - same bug as: process did not finish for some reason... */
// import fetch from "node-fetch";
// import { createWriteStream } from "fs";
// import { Readable } from "stream";

// let asyncCalls = 0;
// const file = createWriteStream("file.json").on("drain", () => {
//   inStream.resume();
// //   console.log(`Write stream buffer draind...`);
// });
// const inStream = new Readable({ read() {} });

// inStream.pipe(file);

// function sendRequest(id) {
//   const callback = (json) => {
//     if (--asyncCalls === 0) {
//       if (!inStream.push(JSON.stringify(json) + "]")) {
//         inStream.pause();
//       }
//     } else {
//       if (!inStream.push(JSON.stringify(json) + ",")) {
//         inStream.pause();
//       }
//     }
//   };

//   fetch(`https://jsonplaceholder.typicode.com/photos/${id}`)
//     .then((response) => response.json())
//     .then(callback)
//     .catch(callback);
// }

// inStream.push("[");
// (async () => {
//   for (let i = 1; i <= 100; i++) {
//     for (let j = 1; j <= 5000; j++) {
//       if (asyncCalls > 5000) {
//         const timeout = await new Promise((res, rej) => {
//           setTimeout(() => res(`Keep sending...`), 1000);
//         });
//         // console.log(timeout);
//       }
//       asyncCalls++;
//       sendRequest(i);
//     }
//   }
// })();

/**version 3 */
// import fetch from "node-fetch";
// import { createWriteStream } from "fs";
// import { Readable } from "stream";

// let asyncCalls = 0;
// const file = createWriteStream("file.json");
// const inStream = new Readable({ read() {} });

// file
//   .on("drain", () => {
//     inStream.resume();
//     console.log(`Write stream buffer draind...`);
//   })
//   .on("error", () => console.log(`write error`))
//   .on("close", () => console.log(`write close`))
//   .on("finish", () => console.log(`write finish`));

// inStream
//   .on("error", () => console.log(`read error`))
//   .on("close", () => console.log(`read close`))
//   .on("end", () => console.log(`read end`));

// inStream.pipe(file);

// function sendRequest(id) {
//   const callback = (json) => {
//     if (--asyncCalls === 0) {
//       inStream.push(JSON.stringify(json) + "]");
//       inStream.destroy(); //Invoked "close" event handler
//       waitUntilFinishWriting();
//     } else {
//       if (!inStream.push(JSON.stringify(json) + ",")) {
//         inStream.pause();
//       }
//     }
//   };

//   fetch(`https://jsonplaceholder.typicode.com/photos/${id}`)
//     .then((response) => response.json())
//     .then(callback)
//     .catch(callback);
// }

// async function waitUntilFinishWriting() {
//   console.log(file.writableLength);
//   if (file.writableLength > 0) {
//     await new Promise((res, rej) => {
//       setTimeout(waitUntilFinishWriting, 1000);
//     });
//   } else {
//     file.destroy();
//   }
// }

// inStream.push("[");
// (async () => {
//   for (let i = 1; i <= 1; i++) {
//     for (let j = 1; j <= 1000; j++) {
//       if (asyncCalls > 5000) {
//         const timeout = await new Promise((res, rej) => {
//           setTimeout(() => res(`Keep sending...`), 1000);
//         });
//         console.log(timeout);
//       }
//       asyncCalls++;
//       sendRequest(j);
//     }
//   }
// })();

/**version 4 */
// import fetch from "node-fetch";
// import { createWriteStream } from "fs";
// import { Readable } from "stream";

// let asyncCalls = 0;
// const file = createWriteStream("file.json");
// const inStream = new Readable({ read() {} });

// file
//   .on("drain", () => {
//     inStream.resume();
//     console.log(`Write stream buffer draind...`);
//   })
//   .on("error", () => console.log(`write error`))
//   .on("close", () => console.log(`write close`))
//   .on("finish", () => console.log(`write finish`));

// inStream
//   .on("error", () => console.log(`read error`))
//   .on("close", () => console.log(`read close`))
//   .on("end", () => console.log(`read end`));

// inStream.pipe(file);

// function sendRequest(id) {
//   const callback = (json) => {
//     if (--asyncCalls === 0) {
//       inStream.push(JSON.stringify(json) + "]");
//       waitUntilFinishWriting();
//     } else {
//       if (!inStream.push(JSON.stringify(json) + ",")) {
//         inStream.pause();
//       }
//     }
//   };

//   fetch(`https://jsonplaceholder.typicode.com/photos/${id}`)
//     .then((response) => response.json())
//     .then(callback)
//     .catch(callback);
// }

// async function waitUntilFinishWriting() {
//   console.log(file.writableLength);
//   if (file.writableLength > 0) {
//     await new Promise((res, rej) => {
//       setTimeout(waitUntilFinishWriting, 1000);
//     });
//   } else {
//     inStream.destroy(); //Invoked "close" event handler
//     file.destroy();
//   }
// }

// inStream.push("[");
// (async () => {
//   for (let i = 1; i <= 100; i++) {
//     for (let j = 1; j <= 5000; j++) {
//       if (asyncCalls > 5000) {
//         const timeout = await new Promise((res, rej) => {
//           setTimeout(() => res(`Keep sending...`), 1000);
//         });
//         console.log(timeout);
//       }
//       asyncCalls++;
//       sendRequest(j);
//     }
//   }
// })();

/**version 5 */
// import fetch from "node-fetch";
// import { createWriteStream } from "fs";
// import { Readable } from "stream";

// let asyncCalls = 0;
// const file = createWriteStream("file.json");
// const inStream = new Readable({ read() {} });

// file
//   .on("drain", () => {
//     inStream.resume();
//     console.log(`Write stream buffer draind...`);
//   })
//   .on("error", () => console.log(`write error`))
//   .on("close", () => console.log(`write close`))
//   .on("finish", () => console.log(`write finish`));

// inStream
//   .on("error", () => console.log(`read error`))
//   .on("close", () => console.log(`read close`))
//   .on("end", () => console.log(`read end`));

// inStream.pipe(file);

// function manageErrors(response) {
//   if (!response.ok) {
//     asyncCalls--;
//     const responseError = {
//       statusText: response.statusText,
//       status: response.status,
//     };
//     throw responseError;
//   }
//   return response;
// }

// function sendRequest(id) {
//   const callback = (json) => {
//     asyncCalls--;
//     console.log(asyncCalls);
//     if (asyncCalls === 0) {
//       inStream.push(JSON.stringify(json) + "]");
//       waitUntilFinishWriting();
//     } else {
//       if (!inStream.push(JSON.stringify(json) + ",")) {
//         inStream.pause();
//       }
//     }
//   };

//   asyncCalls++;
//   fetch(`https://jsonplaceholder.typicode.com/photos/${id}`)
//     .then(manageErrors) // call function to handle errors
//     .then(callback)
//     .catch(function (error) {
//         asyncCalls--
//       console.log("Error Code   : " + error.status);
//       console.log("Error Reason : " + error.statusText);
//     });
// }

// async function waitUntilFinishWriting() {
//   console.log(`waitUntilFinishWriting`);
//   console.log(file.writableLength);
//   if (file.writableLength > 0) {
//     await new Promise((res, rej) => {
//       setTimeout(waitUntilFinishWriting, 1000);
//     });
//   } else {
//     inStream.destroy(); //Invoked "close" event handler
//     file.destroy();
//   }
// }

// inStream.push("[");
// (async () => {
//   for (let i = 1; i <= 5; i++) {
//     for (let j = 1; j <= 5000; j++) {
//       if (asyncCalls > 5000) {
//         const timeout = await new Promise((res, rej) => {
//           setTimeout(() => res(`Keep sending...`), 1000);
//         });
//         console.log(timeout);
//       }
//       sendRequest(j);
//     }
//   }
// })();

/**version 6 */
// import fetch from "node-fetch";
// import { createWriteStream } from "fs";
// import { Readable } from "stream";

// let asyncCalls = 0;
// const file = createWriteStream("file.json");
// const inStream = new Readable({ read() {} });

// file
//   .on("drain", () => {
//     inStream.resume();
//     console.log(`Write stream buffer draind...`);
//   })
//   .on("error", () => console.log(`write error`))
//   .on("close", () => console.log(`write close`))
//   .on("finish", () => console.log(`write finish`));

// inStream
//   .on("error", () => console.log(`read error`))
//   .on("close", () => console.log(`read close`))
//   .on("end", () => console.log(`read end`));

// inStream.pipe(file);

// function manageErrors(response) {
//   test--;
//   console.log(test);
//   if (!response.ok) {
//     asyncCalls--;
//     const responseError = {
//       statusText: response.statusText,
//       status: response.status,
//     };
//     // throw responseError;
//   }
//   //   test++;
//   return response.json();
// }

// function sendRequest(id) {
//   test++;
//   const callback = (json) => {
//     // test--;
//     console.log(test);
//     asyncCalls--;
//     // console.log(asyncCalls);
//     if (test === 0) {
//       inStream.push(JSON.stringify(json) + "]");
//       //   waitUntilFinishWriting();
//     } else {
//       if (!inStream.push(JSON.stringify(json) + ",")) {
//         inStream.pause();
//       }
//     }
//   };

//   asyncCalls++;
//   fetch(`https://jsonplaceholder.typicode.com/photos/${id}`)
//     .then(manageErrors) // call function to handle errors
//     .then(callback)
//     .catch(function (error) {
//       // console.log(error)
//       test--;
//     //   console.log(`test ${test}`);
//       asyncCalls--;
//       //   console.log(asyncCalls);
//       //   console.log("Error Code   : " + error.status);
//       //   console.log("Error Reason : " + error.statusText);
//       if (test === 0) {
//         inStream.push(JSON.stringify(error) + "]");
//         waitUntilFinishWriting();
//       } else {
//         if (!inStream.push(JSON.stringify(error) + ",")) {
//           inStream.pause();
//         }
//       }
//     });
// }
// let test = 0;
// async function waitUntilFinishWriting() {
//   console.log(`waitUntilFinishWriting`);
//   console.log(file.writableLength);
//   if (file.writableLength > 0) {
//     await new Promise((res, rej) => {
//       setTimeout(waitUntilFinishWriting, 1000);
//     });
//   } else {
//     inStream.destroy(); //Invoked "close" event handler
//     file.destroy();
//     // fs.close(file, (err) => {
//     //     if (err)
//     //       console.error('Failed to close file', err);
//     //     else {
//     //       console.log("\n> File Closed successfully");
//     //     }
//     //   });
//   }
// }

// inStream.push("[");
// (async () => {
//   for (let i = 1; i <= 50; i++) {
//     for (let j = 1; j <= 5000; j++) {
//       if (asyncCalls > 5000) {
//         const timeout = await new Promise((res, rej) => {
//           setTimeout(() => res(`Keep sending...`), 1000);
//         });
//         console.log(timeout);
//       }
//       sendRequest(j);
//     }
//   }
// })();

/**version 7 */
// import fetch from "node-fetch";
// import { createWriteStream } from "fs";
// import { Readable } from "stream";

// let asyncCalls = 0;
// const file = createWriteStream("file.json");
// const inStream = new Readable({ read() {} });

// file
//   .on("drain", () => {
//     inStream.resume();
//     // console.log(`Write stream buffer draind...`);
//   })
//   .on("error", () => console.log(`write error`))
//   .on("close", () => {
//     console.log(`write close`);
//     process.exit();
//   })
//   .on("finish", () => console.log(`write finish`));

// inStream
//   .on("error", () => console.log(`read error`))
//   .on("close", () => console.log(`read close`))
//   .on("end", () => console.log(`read end`));

// inStream.pipe(file);

// function manageErrors(response) {
//   test--;
//   console.log(test);
//   if (!response.ok) {
//     asyncCalls--;
//     const responseError = {
//       statusText: response.statusText,
//       status: response.status,
//     };
//   }
//   return response.json();
// }

// function sendRequest(id) {
//   test++;
//   const callback = (json) => {
//     console.log(test);
//     asyncCalls--;
//     // console.log(asyncCalls);
//     if (test === 0) {
//       inStream.push(JSON.stringify(json) + "]");
//       waitUntilFinishWriting();
//     } else {
//       if (!inStream.push(JSON.stringify(json) + ",")) {
//         inStream.pause();
//       }
//     }
//   };

//   asyncCalls++;

//   fetch(`https://jsonplaceholder.typicode.com/photos/${id}`)
//     .then(manageErrors) // call function to handle errors
//     .then(callback)
//     .catch(function (error) {
//       test--;
//       console.log(`test ${test}`);
//       asyncCalls--;
//       if (test === 0) {
//         inStream.push(JSON.stringify(error) + "]");
//         waitUntilFinishWriting();
//       } else {
//         if (!inStream.push(JSON.stringify(error) + ",")) {
//           inStream.pause();
//         }
//       }
//     });
// }

// let test = 0;
// async function waitUntilFinishWriting() {
//   console.log(`waitUntilFinishWriting`);
//   console.log(file.writableLength);
//   if (file.writableLength > 0) {
//     await new Promise((res, rej) => {
//       setTimeout(waitUntilFinishWriting, 1000);
//     });
//   } else {
//     inStream.destroy(); //Invoked "close" event handler
//     file.destroy();
//   }
// }

// inStream.push("[");
// (async () => {
//   for (let i = 1; i <= 200; i++) {
//     for (let j = 1; j <= 5000; j++) {
//       if (asyncCalls > 5000) {
//         const timeout = await new Promise((res, rej) => {
//           setTimeout(() => res(`Keep sending...`), 1000);
//         });
//         // console.log(timeout);
//       }
//       sendRequest(j);
//     }
//     console.log(`round ${i}`);
//   }
// })();
