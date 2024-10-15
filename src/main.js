import { Client, Databases } from 'appwrite';
import axios from 'axios';

// Initialize Appwrite Client
const client = new Client();
const databases = new Databases(client);

// Set up Appwrite client
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)    
    .setKey(process.env.APPWRITE_API_KEY);  

// Function to get flight details and send them to the AI model
export const sendFlightDataToAI = async (flightDocumentId) => {
    try {
        // Check if required environment variables are available
        if (!process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY || 
            !process.env.APPWRITE_DATABASE_ID || !process.env.APPWRITE_COLLECTION_ID || 
            !process.env.HUGGINGFACE_MODEL_URL || !process.env.HUGGINGFACE_API_KEY) {
            console.error("Missing one or more environment variables.");
            throw new Error('Missing environment variables');
        }

        // Retrieve flight details from Appwrite Database
        console.log(`Fetching document with ID: ${flightDocumentId}`);
        const flightDetailsResponse = await databases.getDocument(
            process.env.APPWRITE_DATABASE_ID, // Database ID
            process.env.APPWRITE_COLLECTION_ID, // Collection ID
            flightDocumentId // Document ID
        );

        const flightDetails = flightDetailsResponse;
        console.log('Flight details retrieved:', flightDetails);

        // Prepare the payload for Hugging Face model
        const payload = {
            fromLocation: flightDetails.fromLocation,
            toLocation: flightDetails.toLocation,
            departureDate: flightDetails.departureDate,
            arrivalDate: flightDetails.arrivalDate,
            passengers: flightDetails.passengers,
        };

        // Log the payload before sending
        console.log('Sending payload to Hugging Face model:', payload);

        // Send the data to the AI model (Hugging Face API)
        const response = await axios.post(
            process.env.HUGGINGFACE_MODEL_URL,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const predictionResult = response.data;
        console.log('AI Prediction received:', predictionResult);

        // Save the AI prediction results back to Appwrite
        await databases.updateDocument(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_COLLECTION_ID,
            flightDocumentId,
            {
                aiPrediction: predictionResult,
            }
        );

        console.log('AI prediction saved to Appwrite successfully.');
        return predictionResult;

    } catch (error) {
        console.error('Error sending flight data to AI model:', error);
        throw new Error('Failed to communicate with AI model or save results.');
    }
};
