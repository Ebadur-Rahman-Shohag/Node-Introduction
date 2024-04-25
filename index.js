// old way to import fs module
// const fs = require("fs");
// after adding "type" = "module" in package.json we can import it without using require.
// import fs from "fs"

// ****************************FILES******************************
/*
Blocking, synchronous way
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);
const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);
console.log('File written!');
*/

// Non-blocking, asynchronous way
/*
import { readFile } from "fs";
import { writeFile } from "fs";
//****fs.readFile
readFile("./txt/start.txt", "utf8", (err, data1) => {
  readFile(`./txt/${data1}.txt`, "utf8", (err, data2) => {
    readFile("./txt/append.txt", "utf8", (err, data3) => {
      //****fs.writeFile
      writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf8", (err) => {
        if (err) throw err;
        console.log("File saved");
      });
    });
  });
});
console.log("Finished Executing");
*/

// ***********************SERVER***************************
import http from "http";
import fs from "fs";
import url from "url";
import { fileURLToPath } from "url";
import { dirname } from "path";
import replaceTemplates from "./modules.js/replaceTemplates.mjs";
/*
const replaceTemplates =  (temp, product)=> {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price); // Changed from product.quantity to product.price
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");

  return output;
};
*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  // console.log(req)
  //routing
  // console.log(req.url);


  /*The url.parse() function takes a URL string and returns an object with properties such as href, protocol, host, pathname, search, query, and hash. The second parameter, when set to true, causes the query property to be parsed using querystring module, turning it from a string to an object with each query parameter as a key.
  url: This refers to the URL module in Node.js. You would typically require it at the top of your file if you're not using ES Modules.
  req.url: This refers to the URL of the incoming HTTP request.
  true: This parameter, when set to true, tells the url.parse() method to also parse the query string into an object. This allows you to directly access query parameters as properties of the resulting object.*/ 
  const {query,pathname} = (url.parse(req.url,true))
  // const pathName = req.url;
  // OVERVIEW PAGE
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });

    const cardsHtml = dataObj
      .map((el) => replaceTemplates(tempCard, el))
      .join("");
    const output = tempOverview.replace(/  {%PRODUCT_CARDS%}/g, cardsHtml);
    res.end(output);
  }

  // PRODUCT PAGE
  else if (pathname === "/product") {
    res.writeHead(404, {
      "Content-type": "text/html",
    });
    const product = dataObj[query.id]
    const output = replaceTemplates(tempProduct,product)
    res.end(output);
  }
  // API
  else if (pathname === "/api") {
    res.writeHead(200, {
      "Content-type": "application/json",
    });
  }

  // Not found
  else {
    res.writeHead(404, {
      "Content-type": "text/html",
    });
    res.end("<h1>Page not found</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
