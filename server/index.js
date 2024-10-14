const express = require('express');
const { fetchFlightDetailsAndSendToModel } = require('./huggingface');
const app = express();

app.use(express.json());

app.post('/get-flight-prediction', async (req, res) => {
    const { documentId } = req.body;  // Expecting document ID from the frontend

    try {
        const modelResponse = await fetchFlightDetailsAndSendToModel(documentId);
        res.status(200).json({ data: modelResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(3001, () => {
    console.log('Server running on port 3001');
});
