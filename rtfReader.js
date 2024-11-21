import fs from 'fs';
import path from 'path';
import { parseRTF } from '@iarna/rtf-parser';
import { products } from './seedData.js'; // Adjust the path as necessary
import { uploadImagesToCloudinary } from './index.js'; // Assuming you have a function to upload images

const productsDir = './IMAGES/product/'; // Adjust the path as necessary

async function extractProductDetails() {
    const productFiles = fs.readdirSync(productsDir).filter(file => file.endsWith('.rtf'));
    const products = [];

    for (const file of productFiles) {
        const filePath = path.join(productsDir, file);
        const rtfContent = fs.readFileSync(filePath, 'utf-8');
        
        const parsedContent = await parseRTF(rtfContent);
        const productDetails = extractDetailsFromParsedContent(parsedContent);
        
        products.push(productDetails);
    }

    return products;
}

function extractDetailsFromParsedContent(parsedContent) {
    // Implement logic to extract name, price, quantity, etc. from parsedContent
    // This will depend on the structure of your .rtf files
    // Example:
    const name = parsedContent.find(item => item.text.includes('Name :')).text.split(': ')[1];
    const price = parsedContent.find(item => item.text.includes('Price :')).text.split(': ')[1];
    const quantity = parsedContent.find(item => item.text.includes('Unit')).text.split(': ')[1];

    return {
        name,
        price: parseFloat(price),
        quantity,
        // Add other fields as necessary
    };
}

async function updateProducts() {
    const extractedProducts = await extractProductDetails();
    
    for (const product of extractedProducts) {
        // Upload the product image to Cloudinary and get the URL
        const imageUrl = await uploadImagesToCloudinary(product.imagePath); // Adjust as necessary
        
        // Create a new product object
        const newProduct = {
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            image: imageUrl,
            category: product.category, // You may need to determine the category based on your logic
        };

        products.push(newProduct);
    }

    // Optionally, write the updated products array back to seedData.js
    fs.writeFileSync('./seedData.js', `export const products = ${JSON.stringify(products, null, 2)};`);
}

// Call the updateProducts function
updateProducts();
