(function generatePyramid(totalNumberofRows = 5) {
  for (var i = 1; i <= totalNumberofRows; i++) {
    for (var j = 1; j <= i; j++) {
      process.stdout.write(j.toString());
    }
    process.stdout.write("\n");
  }
})(9);
