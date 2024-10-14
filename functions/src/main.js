const sdk = require("node-appwrite");
const axios = require("axios");
const { process } = require("aframe");

module.exports = async function(req, res) {
   
    const client = new sdk.Client();

    const database = new sdk.Databases(client);
    
    client
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    try {
        // Retrieve the email (or any identifier) passed to the cloud function
        const userEmail = req.variables['userEmail'];

        // Query the Appwrite database to get the flight details
        const response = await database.listDocuments(process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_COLLECTION_ID, [
            sdk.Query.equal('userEmail', userEmail)
        ]);

        if (response.total === 0) {
            return res.status(404).json({ message: "No flight data found for the user" });
        }

        const flightDetails = response.documents[0]; // Assuming we're using the first document returned

        // Prepare the payload to send to Hugging Face model
        const hugFaceResponse = await axios.post(
            'https://api-inference.huggingface.co/models/KingNish/OpenGPT-4o',
            {
                fromLocation: flightDetails.fromLocation,
                toLocation: flightDetails.toLocation,
                departureDate: flightDetails.departureDate,
                arrivalDate: flightDetails.arrivalDate,
                passengers: flightDetails.passengers
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGING_FACE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // The prediction data from Hugging Face
        const prediction = hugFaceResponse.data;

        // Return the predicted flight details to the frontend
        return res.json({
            predictedFlightDetails: prediction,
        });

    } catch (error) {
        // Handle errors (e.g., Appwrite errors, Hugging Face API errors)
        console.error('Error:', error);
        return res.status(500).json({ error: 'Something went wrong!' });
    }
};
