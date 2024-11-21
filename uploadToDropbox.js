import fs from 'fs';
import path from 'path';
import { Dropbox } from 'dropbox';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Dropbox with your access token
const dbx = new Dropbox({ accessToken: process.env.YOUR_ACCESS_TOKEN });

// Function to log responses to a file
const logResponseToFile = (data) => {
    const logFilePath = './uploadLog.json'; // Specify the log file path
    const logData = fs.existsSync(logFilePath) ? JSON.parse(fs.readFileSync(logFilePath)) : []; // Read existing log data
    logData.push(data); // Add new log entry
    fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2)); // Write updated log data to file
};

const uploadFileToDropbox = async (filePath, dropboxPath) => {
    try {
        const fileData = fs.readFileSync(filePath);

        // Upload the file to Dropbox
        const response = await dbx.filesUpload({
            path: dropboxPath, // Path in Dropbox
            contents: fileData,
        });

        console.log(`Uploaded: ${filePath}`);
        
        // Create the correct file link using path_display
        const fileLink = `https://www.dropbox.com${response.result.path_display}`; // Correct link
        // console.log(`Temporary File link: ${fileLink}`);

        // Create a shareable link
        const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
            path: response.result.path_lower, // Ensure this is the correct path
        });

        // Log the shared link response to check its structure
        // console.log('Shared link response:', sharedLinkResponse);

        // Extract the product name from the file path
        const productName = path.basename(path.dirname(filePath)); // Get the name of the parent directory
        console.log(`Extracted Product Name: ${productName}`);

        // Check if the URL is defined before using it
        if (sharedLinkResponse.result.url) {
            const shareableLink = sharedLinkResponse.result.url.replace('?dl=0', '?raw=1'); // Modify link for direct access
            console.log(`Shareable File link: ${shareableLink}`);

            // Log both responses to a file
            logResponseToFile({
                // uploadedFile: filePath,
                // dropboxPath: dropboxPath,
                subCategory: path.basename(path.dirname(path.dirname(filePath))),
                category:path.basename(path.dirname(path.dirname(path.dirname(filePath)))),
                name: productName, // Store the extracted product name
                sharedLink: shareableLink,
                // uploadResponse: response,
                // sharedLinkResponse: sharedLinkResponse,
            });

            return shareableLink; // Return the shareable link for later use
        } else {
            console.error('Shared link URL is undefined.');
            return null; // Or handle this case as needed
        }
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

const uploadRTFFilesRecursively = async (directory, dropboxBasePath) => {
    const files = fs.readdirSync(directory);
    const productRtfLinks = []; // Array to store product names and their RTF links

    for (const file of files) {
        const filePath = path.join(directory, file);
        const relativePath = path.relative(baseDirectory, filePath); // Get the relative path from the base directory
        const dropboxPath = path.join(dropboxBasePath, relativePath).replace(/\\/g, '/'); // Maintain folder structure

        if (fs.statSync(filePath).isDirectory()) {
            // If it's a directory, call the function recursively
            const nestedLinks = await uploadRTFFilesRecursively(filePath, dropboxBasePath);
            productRtfLinks.push(...nestedLinks); // Merge nested links
        } else if (file.endsWith('.rtf')) {
            // Upload only RTF files
            const link = await uploadFileToDropbox(filePath, dropboxPath);
            
            // Extract product name from the parent directory
            const productName = path.basename(path.dirname(filePath)); // Get the name of the parent directory
            productRtfLinks.push({ name: productName, link }); // Store the product name and link
        }
    }

    return productRtfLinks; // Return the collected links
};

// Specify the base directory containing your RTF files
const baseDirectory = './IMAGES/product/'; // Adjust as necessary
const dropboxBasePath = '/Home'; // Adjust to your desired Dropbox folder

// Start the upload process
uploadRTFFilesRecursively(baseDirectory, dropboxBasePath)
    .then((productRtfLinks) => {
        console.log('Upload process completed.');
        // Write the product RTF links to a JSON file
        fs.writeFileSync('./productRtfArray.json', JSON.stringify(productRtfLinks, null, 2));
        console.log('RTF links saved to productRtfArray.json');
    })
    .catch(error => console.error('Error during upload process:', error)); 