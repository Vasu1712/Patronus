const axios = require('axios');
const { Client, Databases } = require('node-appwrite');  // Ensure you've appwrite SDK installed
require('dotenv').config();

const client = new Client();
const databases = new Databases(client);

// Initialize your Appwrite client
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

// Function to fetch flight details from Appwrite DB and send it to Hugging Face
const fetchFlightDetailsAndSendToModel = async (documentId) => {
    try {
        // Fetch flight details from Appwrite
        const response = await databases.getDocument(process.env.APPWRITE_PROJECT_ID, process.env.APPWRITE_DATABASE_ID, documentId);   
        const flightDetails = response;

        // Call Hugging Face API
        const hugResponse = await axios.post('https://api-inference.huggingface.co/models/KingNish/OpenGPT-4o', {
            inputs: flightDetails,  // Pass flight details as inputs
        }, {
            headers: { 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}` }  // Use Hugging Face API key from .env
        });

        return hugResponse.data;  // Return model response
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error processing request');
    }
};

// Export the function so it can be used in API routes
module.exports = { fetchFlightDetailsAndSendToModel };
