const extractElements = require("./custom_modules/links_extractor.js");
const fs = require('fs');

var elements = {};
var reportName = Date.now();
fs.appendFileSync(`report-${reportName}.json`, `[\n`);

var elementsExtracted = async function (response) {

  if (elements[response.selfURL] == undefined) {
    elements[response.selfURL] = response;
  } else {
    return;
  }
  console.log(response.selfURL);
  fs.appendFileSync(`report-${reportName}.json`, `${JSON.stringify(response)},\n`);

  for (var i = 0; i < response.subURLs.length; i++) {
    // console.log(`${i}: ${response.subURLs[i]}`);
    if (!elements[response.subURLs[i]]) {
      try {
        await extractElements(response.subURLs[i]).then(elementsExtracted);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

try {
  extractElements(process.argv[2]).then(elementsExtracted);
} catch (error) {
  console.error(error);
}