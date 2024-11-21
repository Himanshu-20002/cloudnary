import fs from 'fs';
import path from 'path';
import parseRTF from 'rtf-parser'; // Adjust based on your import method
import { glob } from 'glob'; // Import glob directly

// Function to extract details from parsed RTF content
async function extractDetailsFromParsedContent(parsedContent) {
    let content = '';

    // Listen for data events to accumulate the parsed content
    parsedContent.on('data', (chunk) => {
        content += chunk; // Accumulate the chunks of data
    });

    // Listen for the end event to process the complete content
    return new Promise((resolve, reject) => {
        parsedContent.on('end', () => {
            console.log('Complete content:', content); // Log complete content
            const productDetails = extractProductDetails(content);
            resolve(productDetails);
        });

        // Handle errors
        parsedContent.on('error', (error) => {
            console.error('Error parsing RTF:', error);
            reject(error);
        });
    });
}

function extractProductDetails(content) {
    // Use regular expressions to extract details
    const nameMatch = content.match(/Product Details\s*\\par\s*(.*?)(?=\\par)/s);
    const quantityMatch = content.match(/Unit\s*:\\par\s*(.*?)(?=\\par)/s);
    const descriptionMatch = content.match(/Description\s*:\\par\s*(.*?)(?=\\par)/s);

    return {
        name: nameMatch ? nameMatch[1].trim() : null,
        quantity: quantityMatch ? quantityMatch[1].trim() : null,
        description: descriptionMatch ? descriptionMatch[1].trim() : null,
    };
}

// Function to get all RTF files
async function getAllRtfFiles(dir) {
    try {
        const files = await glob('**/*.rtf', {
            cwd: dir,
            nodir: true,
            absolute: true,
        });
        console.log('Found RTF files:', files); // Log found files
        return files;
    } catch (error) {
        console.error('Error fetching RTF files:', error);
        return [];
    }
}

// Function to create a product array from RTF files
async function createProductArray(dir) {
    const rtfFiles = await getAllRtfFiles(dir);
    const productArray = [];

    for (const rtfFile of rtfFiles) {
        console.log(`Processing file: ${rtfFile}`); // Log the file being processed
        try {
            const rtfContent = fs.readFileSync(rtfFile, 'utf-8');
            console.log('RTF Content Read:', rtfContent); // Log the content read from the file
            const parsedContent = await parseRTF(rtfContent);
            console.log('Parsed Content:', parsedContent); // Log the parsed content
            const productDetails = await extractDetailsFromParsedContent(parsedContent);
            if (productDetails) {
                productArray.push(productDetails);
            }
        } catch (error) {
            console.error(`Error extracting details from ${rtfFile}:`, error.message);
        }
    }

    return productArray;
}

// Main function to run the script
(async function run() {
    console.log('Script started...'); // Log when the script starts
    const imagesDir = './IMAGES/product/'; // Specify the directory containing your RTF files
    const productArray = await createProductArray(imagesDir);
    
    console.log('Constructed Product Array:', productArray);
})();