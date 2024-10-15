import { Client, Databases } from 'appwrite';
import axios from 'axios';

// Initialize Appwrite Client
const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') // Set your Appwrite API endpoint
    .setProject(process.env.APPWRITE_PROJECT_ID); // Set your Appwrite project ID

// Initialize the Databases service
const databases = new Databases(client);

// Function to get flight details and send them to the AI model
export const sendFlightDataToAI = async (flightDocumentId) => {
    try {
        // Retrieve flight details from Appwrite Database
        const flightDetailsResponse = await databases.getDocument(
            process.env.APPWRITE_DATABASE_ID, // Database ID
            process.env.APPWRITE_COLLECTION_ID, // Collection ID
            flightDocumentId, // Document ID
            {
                headers: {
                    'X-Appwrite-Key': process.env.APPWRITE_API_KEY,  // Use API key in headers
                },
            }
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
            },
            {
                headers: {
                    'X-Appwrite-Key': process.env.APPWRITE_API_KEY, // Use API key in headers
                },
            }
        );

        return predictionResult;
    } catch (error) {
        console.error('Error sending flight data to AI model:', error);
        throw new Error('Failed to communicate with AI model or save results.');
    }
};
