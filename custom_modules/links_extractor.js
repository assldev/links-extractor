const puppeteer = require('puppeteer');

var extractElements = async function (url) {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle0'
  });

  const elementHandles = await page.$$('a');
  const hrefHandles = await Promise.all(
    elementHandles.map(handle => handle.getProperty('href'))
  );
  const hrefStrings = await Promise.all(
    hrefHandles.map(handle => handle.jsonValue())
  );
  let uniqueHREFsSet = new Set(hrefStrings);
  filterEmptyLinks(uniqueHREFsSet);
  filterSamePageLinks(page.url(), uniqueHREFsSet);
  const uniqueURLs = Array.from(uniqueHREFsSet);
  const subURLs = extractSubURLs(uniqueHREFsSet, page.url());
  const externalURLs = uniqueURLs.filter(x => !subURLs.includes(x));

  await browser.close();

  return {
    'subURLs': subURLs,
    'externalURLs': externalURLs
  };
};

var filterEmptyLinks = function (uniqueHREFsSet) {
  uniqueHREFsSet.delete('');
}

var filterSamePageLinks = function (pageURL, uniqueHREFsSet) {
  let pageRoot = pageURL.substring(0, pageURL.length - 1);
  uniqueHREFsSet.forEach(function (url) {
    if (url.startsWith(pageRoot + "#") ||
      url.startsWith(pageRoot + "?") ||
      url.startsWith(pageRoot + "/#") ||
      url.startsWith(pageRoot + "/?")) {
      uniqueHREFsSet.delete(url);
    }
  });
}

var extractSubURLs = function (uniqueHREFsSet, pagrURL) {
  let subURLs = [];
  uniqueHREFsSet.forEach(function (url) {
    if (url.startsWith(pagrURL)) {
      subURLs.push(url);
    }
  });
  return subURLs;
}

module.exports = extractElements;