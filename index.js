import dotenv from 'dotenv';
dotenv.config();

import cloudinary from 'cloudinary';
import pLimit from 'p-limit';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configure Cloudinary with your credentials
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Specify the root directory containing your product images
const imagesDir = './IMAGES/product/';

// Initialize the product array
const productArray = [];

// Create a write stream for logging
const logStream = fs.createWriteStream('upload.log', { flags: 'a' });

// Override console.log to write to both console and log file
console.log = (message) => {
  process.stdout.write(message + '\n'); // Print to console
  logStream.write(message + '\n'); // Write to log file
};

async function getAllImageFiles(dir) {
  try {
    const files = await glob('**/*.{jpg,jpeg,png,gif,webp}', {
      cwd: dir,
      nodir: true,
      absolute: true,
    });
    return files;
  } catch (error) {
    console.error('Error fetching image files:', error);
    return [];
  }
}

const sanitizePath = (path) => {
  return path
    .replace(/&/g, 'and') // Replace '&' with 'and'
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_\/]/g, ''); // Remove any other invalid characters
};

const uploadWithRetry = async (imagePath, folderPath, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const sanitizedFolderPath = sanitizePath(folderPath); // Sanitize the folder path
      const result = await cloudinary.v2.uploader.upload(imagePath, {
        folder: `products/${sanitizedFolderPath}`,
      });
      return result; // Return the result if successful
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${imagePath}:`, error.message);
      if (attempt === retries) throw error; // Throw error if all attempts fail
    }
  }
}

(async function run() {
  try {
    // Retrieve all image files recursively
    const images = await getAllImageFiles(imagesDir);
    console.log(`Found ${images.length} image(s) to upload.`);

    if (images.length === 0) {
      console.log('No images found to upload.');
      return;
    }

    // Limit concurrent uploads to 5 (adjust as needed)
    const limit = pLimit(5);

    const uploadPromises = images.map((imagePath) =>
      limit(async () => {
        const relativePath = path.relative(imagesDir, imagePath);
        const folderPath = path.dirname(relativePath).replace(/\\/g, '/'); // For Windows compatibility

        try {
          console.log(`Uploading ${relativePath} to folder products/${folderPath}`);
          const result = await uploadWithRetry(imagePath, folderPath);
          console.log(`Successfully uploaded ${relativePath}`);
          console.log(`> URL: ${result.secure_url}`);

          // Construct the product object
          const productName = path.basename(relativePath, path.extname(relativePath)); // Use the image name without extension
          const category = folderPath; // Use the folder path as category
          const existingProduct = productArray.find(product => product.name === productName && product.category === category);

          if (existingProduct) {
            // If the product already exists, push the new image URL into the images array
            existingProduct.images.push(result.secure_url);
            console.log(`Updated existing product: ${productName}`);
          } else {
            // If the product does not exist, create a new entry
            productArray.push({
              name: productName,
              images: [result.secure_url], // Initialize with the first image URL
              category: category, // Store the folder path as category
            });
            console.log(`Added new product: ${productName}`);
          }

          return {
            url: result.secure_url,
            category: category, // Store the folder path as category
            imageName: path.basename(relativePath), // Store the image name
          };
        } catch (uploadError) {
          console.error(`Error uploading ${relativePath}:`, uploadError.message);
          // Continue processing other images even if this one fails
        }
      })
    );

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);

    console.log('All uploads completed.');
    console.log('Uploaded Image URLs:');
    results.forEach((result) => {
      if (result) {
        console.log(`Category: ${result.category}, Image: ${result.imageName}, URL: ${result.url}`);
      }
    });

    // Log the constructed product array
    console.log('Constructed Product Array:', productArray);

    // Save the product array to a JSON file
    fs.writeFileSync('productArray.json', JSON.stringify(productArray, null, 2), 'utf-8');
    console.log('Product array saved to productArray.json');
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
})();