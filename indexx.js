import dotenv from 'dotenv';
dotenv.config();

import { createProductArray } from './rtfReader.js'; // Import the function

(async function run() {
  try {
    const imagesDir = './IMAGES/product/'; // Specify the directory containing your RTF files
    const productArray = await createProductArray(imagesDir);
    
    console.log('Constructed Product Array:', productArray);
    
    // Here you can insert the productArray into your database
    // Example: await insertProductsIntoDatabase(productArray);

  } catch (error) {
    console.error('An error occurred:', error.message);
  }
})();