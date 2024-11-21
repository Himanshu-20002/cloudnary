import fs from "fs";
import path from "path";

// Get the directory name from the current module's URL
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Read the mergedArray.json file
const mergedArrayPath = path.resolve("mergedArray.json");
const mergedArray = JSON.parse(fs.readFileSync(mergedArrayPath, "utf8"));

// Read the products.json file
const productsPath = path.resolve("products.json");
const productsArray = JSON.parse(fs.readFileSync(productsPath, "utf8"));

// Create a mapping of products by title for easy lookup
const productsMap = new Map();
productsArray.forEach(product => {
  productsMap.set(product.title, {
    quantity: product.quantity,
    price: product.price
  });
});

// Merge the arrays
const finalArray = mergedArray.map(item => {
  const productDetails = productsMap.get(item.name) || { quantity: "", price: "" };

  return {
    ...item,
    quantity: productDetails.quantity,
    price: productDetails.price
  };
});

// Write the final array to finalArray.json
const finalArrayPath = path.resolve("finalArray.json");
fs.writeFileSync(finalArrayPath, JSON.stringify(finalArray, null, 2), "utf8");

// Output the final array to the console
console.log(finalArray);