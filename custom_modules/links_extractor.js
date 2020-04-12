const puppeteer = require('puppeteer');

var extractElements = async function (url) {

  if (url.endsWith(".pdf")) {
    throw new Error(`INVALID_URL: ${url}`);
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle0'
  });
  const originialPageURL = page.url();
  const originialPageURLWithoutParams = originialPageURL.split("?")[0].split("#")[0];
  const pageURL = originialPageURLWithoutParams.endsWith("/") ?
    originialPageURLWithoutParams.substring(0, originialPageURLWithoutParams.length - 1) :
    originialPageURLWithoutParams;

  const elementHandles = await page.$$('a');
  const hrefHandles = await Promise.all(
    elementHandles.map(handle => handle.getProperty('href'))
  );
  const hrefStrings = await Promise.all(
    hrefHandles.map(handle => handle.jsonValue())
  );
  let uniqueHREFsSet = new Set(hrefStrings);
  filterEmptyLinks(uniqueHREFsSet);
  const uniqueURLsSet = filterSamePageLinks(uniqueHREFsSet, pageURL);
  const uniqueURLsArray = Array.from(uniqueURLsSet);
  const subURLsArray = extractSubURLs(uniqueURLsSet, pageURL);
  const externalURLsArray = uniqueURLsArray.filter(x => !subURLsArray.includes(x));

  await browser.close();

  return {
    'selfURL': pageURL,
    'subURLs': subURLsArray,
    'externalURLs': externalURLsArray
  };
};

var filterEmptyLinks = function (uniqueHREFsSet) {
  uniqueHREFsSet.delete('');
}

var filterSamePageLinks = function (uniqueHREFsSet, pageURL) {
  let filteredSet = new Set();
  uniqueHREFsSet.forEach(function (url) {
    let actualURL = url.split("?")[0].split("#")[0];
    if (actualURL[actualURL.length - 1] == "/") {
      actualURL = actualURL.substring(0, actualURL.length - 1);
    }
    if (actualURL != pageURL) {
      filteredSet.add(actualURL);
    }
  });
  return filteredSet;
}

var extractSubURLs = function (uniqueHREFsSet, pageURL) {
  let subURLs = [];
  pageURL = pageURL.split("/")[2];
  uniqueHREFsSet.forEach(function (url) {
    let siteURL = url.split("/")[2];
    if (siteURL == pageURL) {
      subURLs.push(url);
    }
  });
  return subURLs;
}

module.exports = extractElements;