function mySlowFunction(baseNumber) {
  let result = 0;
  for (let i = Math.pow(baseNumber, 5); i >= 0; i--) {
    result += Math.atan(i) * Math.tan(i);
  }
  return result;
}

process.on("message", (message) => {
  const result = mySlowFunction(message.number);
  process.send(result);
  process.exit(); //terminate process after it's done
});
