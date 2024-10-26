import { HfInference } from '@huggingface/inference';
import { Client, Databases, Messaging, Users, Account } from 'node-appwrite';
import { ID } from 'appwrite';

export default async ({ req, res, log }) => {

    try {

    log('Request Body:', req.body);

    const { documentId, userEmail, userId } = req.body;

    if (!documentId || !userEmail ||  !userId) {
        log('Missing required fields');
        return res.json({
            ok: false,
            error: 'Missing required fields: documentId or userEmail'
        }, 400);
    }

    const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject('6704100e000400efea98')
        .setKey('standard_0e22f3fd38a1d9160f7e6a8111cc6a5f875b73f0c538c67f42d436eb9af0827c2ec7199e712286b02ba2e7c9a01302742654bd7e79462979555f2b84bab55dfd7857e20d210971c8fc58402e2fcbfd3a5f4bf865f8cc0513f8da642cde125ab25686172bf87c99e4878e6e527cd538ca459c4a0e9e804cc5732bcc18f870c944');

    const databases = new Databases(client);
    const account = new Account(client);
       
        const document = await databases.getDocument(
            '670d6cf40006f6102f3c', 
            '670d6d030007cc158b32', 
            documentId
        );
        
        log('Fetched document:', document); 

        const hf = new HfInference('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');
        const prompt = `Given the following details:
        {
            "fromLocation": "${document.fromLocation}",
            "toLocation": "${document.toLocation}",
            "departureDate": "${document.departureDate}",
            "arrivalDate": "${document.arrivalDate}",
            "passengers": "${document.passengers}"
        }
        Return a valid JSON object with fields: fromLocation, toLocation, departureDate, arrivalDate, takeOffTime, landingTime, passengers, ticketPrice, airline, bookingLink. Do not include any explanation or additional text.`;
                
        // log('Sending request to Hugging Face...');

        const response = await hf.textGeneration({
            model: 'mistralai/Mistral-7B-Instruct-v0.2',
            inputs: prompt,
            parameters: { max_new_tokens: 200 }
        });

        if (!response || !response.generated_text) {
            log('AI Response is empty or invalid');
            return res.json({ 
                ok: false, 
                error: 'AI response was empty or invalid' 
            }, 500);
        }
    
        // log('AI Response:', response.generated_text); 

        const mail = new Messaging(client);
        const messageId = ID.unique();

        log("User Email:", userEmail);
        log("User ID:", userId);

        const aiResponseJson = response.generated_text;
        const {
            fromLocation,
            toLocation,
            departureDate,
            arrivalDate,
            passengers,
            ticketPrice,
            airline,
            bookingLink,
            takeOffTime,
            landingTime,
        } = aiResponseJson;

        // HTML Template for Email Content
        const emailContent = `
            <html>
                <body>
                    <h2>Flight Details</h2>
                    <table border="1" cellpadding="5" cellspacing="0">
                        <tr>
                            <th>From</th>
                            <td>${fromLocation}</td>
                        </tr>
                        <tr>
                            <th>To</th>
                            <td>${toLocation}</td>
                        </tr>
                        <tr>
                            <th>Departure Date</th>
                            <td>${departureDate}</td>
                        </tr>
                        <tr>
                            <th>Arrival Date</th>
                            <td>${arrivalDate}</td>
                        </tr>
                        <tr>
                            <th>Passengers</th>
                            <td>${passengers}</td>
                        </tr>
                        <tr>
                            <th>Ticket Price</th>
                            <td>${ticketPrice}</td>
                        </tr>
                        <tr>
                            <th>Airline</th>
                            <td>${airline}</td>
                        </tr>
                        <tr>
                            <th>Booking Link</th>
                            <td><a href="${bookingLink}">${bookingLink}</a></td>
                        </tr>
                        <tr>
                            <th>Takeoff Time</th>
                            <td>${takeOffTime}</td>
                        </tr>
                        <tr>
                            <th>Landing Time</th>
                            <td>${landingTime}</td>
                        </tr>
                    </table>
                </body>
            </html>
        `;

        const attachment = {
            filename: 'flight_details.html',
            content: Buffer.from(emailContent, 'utf-8'),
            contentType: 'text/html',
          };

        const emailResponse = await mail.createEmail(
            messageId,
            'AI Response for Flight Details', 
            emailContent, 
            [userId],
            [],
            [],
            [],
            [],
            [],
            false,
            true,
          );

        // log('Mailgun response:', emailResponse);

        return res.json(
            { 
                ok: true, 
                aiResponse: response.generated_text, 
                isEmailSent: emailResponse,
            }, 
            200, 
            {   
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'POST, GET',
            }
);

    } catch (err) {
        log('Error fetching document or querying model:', err);
        return res.json({ ok: false, error: 'Error fetching document or querying model' }, 500); 
    }
};
