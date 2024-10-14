import { Client, Databases, Query } from 'appwrite';
import axios from 'axios';

const client = new Client();
const databases = new Databases(client);

// Initialize Appwrite Client
client
    .setEndpoint('https://cloud.appwrite.io/v1') // Appwrite API Endpoint
    .setProject(process.env.APPWRITE_PROJECT_ID)    // Project ID
    .setKey(process.env.APPWRITE_API_KEY);          // API Key

// Function to get flight details and send them to the AI model
export const sendFlightDataToAI = async (flightDocumentId) => {
    try {
        // Retrieve flight details from Appwrite Database
        const flightDetailsResponse = await databases.getDocument(
            process.env.APPWRITE_DATABASE_ID, // Database ID
            process.env.APPWRITE_COLLECTION_ID, // Collection ID
            flightDocumentId // Document ID
        );

        const flightDetails = flightDetailsResponse;
        
        // Prepare the payload for Hugging Face model
        const payload = {
            fromLocation: flightDetails.fromLocation,
            toLocation: flightDetails.toLocation,
            departureDate: flightDetails.departureDate,
            arrivalDate: flightDetails.arrivalDate,
            passengers: flightDetails.passengers,
        };

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

        // Handle the AI model's response
        console.log('AI Prediction:', predictionResult);

        // Save the AI prediction results back to Appwrite
        await databases.updateDocument(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_COLLECTION_ID,
            flightDocumentId,
            {
                aiPrediction: predictionResult,
            }
        );

        return predictionResult;
    } catch (error) {
        console.error('Error sending flight data to AI model:', error);
        throw new Error('Failed to communicate with AI model or save results.');
    }
};
