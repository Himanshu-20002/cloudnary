import fs from "fs";
import path from "path";

// Get the directory name from the current module's URL
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Read the productArray.json file
const productArrayPath = path.resolve("productArray.json");
const productArray = JSON.parse(fs.readFileSync(productArrayPath, "utf8"));

// Process each product to extract the name from the category
const updatedProductArray = productArray.map(product => {
  // Split the category by '/' and get the last part as the product name
  const categoryParts = product.category.split('/');
  const productName = categoryParts[categoryParts.length - 1].trim();

  // Replace the rubbish name with the extracted product name
  return {
    ...product,
    name: productName // Update the name field
  };
});

// Write the updated array back to the productArray.json file
fs.writeFileSync(productArrayPath, JSON.stringify(updatedProductArray, null, 2), "utf8");

// Output the updated array to the console
console.log(updatedProductArray);