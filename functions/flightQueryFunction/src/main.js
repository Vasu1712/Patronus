import { HfInference } from '@huggingface/inference';
import { Client, Databases } from 'node-appwrite';

export default async ({ req, res, log }) => {
    // Log the request body to verify it's being received correctly
    log('Request Body:', req.body);

    log('Appwrite Project ID:', process.env.APPWRITE_PROJECT_ID);
    log('Hugging Face API key:', process.env.HUGGING_FACE_API_KEY);

    // Check for required fields in the request body
    const { documentId, userEmail } = req.body;
    if (!documentId || !userEmail) {
        return res.json({
            ok: false,
            error: 'Missing required fields: documentId or userEmail'
        }, 400);
    }

    // Initialize Appwrite client and database instance
    const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    try {
        // Fetch the document from Appwrite using documentId
        const document = await databases.getDocument(
            '670d6cf40006f6102f3c', // Replace with your Appwrite Database ID
            '670d6d030007cc158b32', // Replace with your Appwrite Collection ID
            documentId
        );
        
        log('Fetched document:', document); // Log the fetched document for debugging

        // Query Hugging Face API for AI-generated response
        const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);
        const prompt = `Generate the cheapest flight details for:
        From: ${document.fromLocation}
        To: ${document.toLocation}
        Departure Date: ${document.departureDate}
        Arrival Date: ${document.arrivalDate}
        Passengers: ${document.passengers}`;

        const completion = await hf.textGeneration({
            model: 'mistralai/Mistral-7B-Instruct-v0.2',
            inputs: prompt,
            parameters: { max_new_tokens: 200 }
        });

        log('AI Response:', completion); // Log the AI response for debugging

        // Return the AI response
        return res.json({ ok: true, aiResponse: completion }, 200);
    } catch (err) {
        log('Error fetching document or querying model:', err);
        return res.json({ ok: false, error: 'Error fetching document or querying model' }, 500);
    }
};
