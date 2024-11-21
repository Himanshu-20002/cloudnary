import fs from 'fs';

// Function to group images in the product array
const groupImagesInProductArray = () => {
  // Read the existing product array from the JSON file
  const data = fs.readFileSync('productArray.json', 'utf-8');
  const productArray = JSON.parse(data);

  // Create a new object to group products
  const groupedProducts = {};

  // Iterate through the existing product array
  productArray.forEach(product => {
    const category = product.category; // Use the category for grouping
    const key = category; // Use category as the unique key for grouping

    if (!groupedProducts[key]) {
      // If the product doesn't exist in the grouped object, create a new entry
      groupedProducts[key] = {
        name: product.name, // Keep the original name of the first product
        images: [...product.images], // Initialize with the existing images
        category: category,
      };
    } else {
      // If the product already exists, append the new images
      groupedProducts[key].images.push(...product.images);
    }
  });

  // Convert the grouped object back to an array
  const updatedProductArray = Object.values(groupedProducts);

  // Save the updated product array back to the JSON file
  fs.writeFileSync('productArray.json', JSON.stringify(updatedProductArray, null, 2), 'utf-8');
  console.log('Product array updated and saved to productArray.json');
};

// Run the function
groupImagesInProductArray();