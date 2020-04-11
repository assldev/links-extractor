const extractElements = require("./custom_modules/links_extractor.js");

extractElements(process.argv[2]).then(function (response) {
  console.log(response);
});