// const axios = require('axios');

// const fetchHistoricalFlightData = async (fromLocation, toLocation, departureDate) => {
//     const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
//     const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;

//     try {
//         const tokenResponse = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', {
//             grant_type: 'client_credentials',
//             client_id: L1QG0GpTOrdEcxQiLK5apJOd7mCPkGTp,
//             client_secret: Kd3AFTqi1AcC5eGh
//         });

//         const accessToken = tokenResponse.data.access_token;

//         const response = await axios.get(
//             `https://test.api.amadeus.com/v2/shopping/flight-offers`, {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`
//             },
//             params: {
//                 originLocationCode: fromLocation,
//                 destinationLocationCode: toLocation,
//                 departureDate: departureDate,
//             }
//         });

//         return response.data;
//     } catch (error) {
//         console.error('Error fetching historical data:', error);
//         return null;
//     }
// };

// module.exports = { fetchHistoricalFlightData };
