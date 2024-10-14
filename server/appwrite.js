






// const { Client, Databases } = require('appwrite');


// // Initialize Appwrite client
// const client = new Client()
//     .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
//     .setProject('6704100e000400efea98')               // Your project ID
//     .setKey('standard_0e22f3fd38a1d9160f7e6a8111cc6a5f875b73f0c538c67f42d436eb9af0827c2ec7199e712286b02ba2e7c9a01302742654bd7e79462979555f2b84bab55dfd7857e20d210971c8fc58402e2fcbfd3a5f4bf865f8cc0513f8da642cde125ab25686172bf87c99e4878e6e527cd538ca459c4a0e9e804cc5732bcc18f870c944');                 

//     const realtime = new Realtime(client);
//     const databases = new Databases(client);
    
//     // Listen to Appwrite Realtime for new flight requests
//     realtime.subscribe('databases.DATABASE_ID.collections.COLLECTION_ID.documents', response => {
//         if (response.events.includes('databases.*.collections.*.documents.*.create')) {
//             const flightRequestData = response.payload;
//             handleFlightRequest(flightRequestData);
//         }
//     });
    
//     async function handleFlightRequest(flightRequestData) {
//         // Call Amadeus API to get historical data
//         const amadeusData = await fetchAmadeusData(flightRequestData);
        
//         // Call the Hugging Face Mistral7B model with combined data
//         const prediction = await callHuggingFaceModel(flightRequestData, amadeusData);
        
//         // Store the prediction back in Appwrite
//         await storePrediction(flightRequestData.$id, prediction);
//     }
    
//     // Fetch Amadeus API data (see next step)
//     async function fetchAmadeusData(flightRequestData) {
//         // Use Amadeus API to fetch historical flight data based on from/to locations
//         // Return historical flight prices or other relevant data
//         // ...
//     }
    
//     // Send data to Hugging Face model (see next step)
//     async function callHuggingFaceModel(flightRequestData, amadeusData) {
//         // Combine flight request data and Amadeus data
//         const inputData = {
//             ...flightRequestData,
//             amadeusData: amadeusData
//         };
    
//         // Call Hugging Face Inference API with Mistral7B model
//         const response = await fetch('https://api-inference.huggingface.co/models/Mistral7B', {
//             method: 'POST',
//             headers: {
//                 Authorization: 'Bearer YOUR_HUGGING_FACE_API_TOKEN',
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(inputData),
//         });
    
//         const prediction = await response.json();
//         return prediction;
//     }
    
//     // Store prediction back to Appwrite Database
//     async function storePrediction(documentId, prediction) {
//         await databases.updateDocument('DATABASE_ID', 'COLLECTION_ID', documentId, {
//             prediction: prediction,
//         });
//     }



