import fs from "fs";
import path from "path";

// Get the directory name from the current module's URL
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Read the productArray.json file
const productArrayPath = path.resolve("productArray.json");
const productArray = JSON.parse(fs.readFileSync(productArrayPath, "utf8"));

// Read the uploadLog.json file
const uploadLogPath = path.resolve("uploadLog.json");
const uploadLog = JSON.parse(fs.readFileSync(uploadLogPath, "utf8"));

// Merging the arrays
const mergedArray = uploadLog.map(logItem => {
  const product = productArray.find(productItem => productItem.name === logItem.name);
  
  return {
    name: logItem.name,
    subCategory: logItem.subCategory,
    category: logItem.category,
    sharedLink: logItem.sharedLink,
    images: product ? product.images : [] // Add images if product is found, else empty array
  };
});

// Write the merged array to a new file
const mergedArrayPath = path.resolve("mergedArray.json");
fs.writeFileSync(mergedArrayPath, JSON.stringify(mergedArray, null, 2), "utf8");

// Output the merged array to the console
console.log(mergedArray);

console.log("Product Array Path:", productArrayPath);