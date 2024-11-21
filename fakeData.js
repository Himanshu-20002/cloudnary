import fs from "fs";
import path from "path";

// Get the directory name from the current module's URL
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Read the finalArray.json file
const finalArrayPath = path.resolve("finalArray.json");
const finalArray = JSON.parse(fs.readFileSync(finalArrayPath, "utf8"));

// Sample data arrays
const sampleQuantities = ["1 unit", "500 g", "2 units", "250 ml", "1 pack", "3 pieces"];
const samplePrices = ["₹100", "₹150", "₹200", "₹250", "₹300", "₹350"];

// Function to get a random sample from an array
const getRandomSample = (array) => array[Math.floor(Math.random() * array.length)];

// Update the final array with random sample data for empty fields
finalArray.forEach(product => {
  if (product.quantity === "") {
    product.quantity = getRandomSample(sampleQuantities); // Fill with random sample quantity
  }
  if (product.price === "") {
    product.price = getRandomSample(samplePrices); // Fill with random sample price
  }
});

// Write the updated array back to finalArray.json
fs.writeFileSync(finalArrayPath, JSON.stringify(finalArray, null, 2), "utf8");

// Output the updated array to the console
console.log("Final array updated with varied sample data:", finalArray);