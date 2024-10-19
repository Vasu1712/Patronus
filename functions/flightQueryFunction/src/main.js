import { HfInference } from '@huggingface/inference';
import { Client, Databases } from 'node-appwrite';

export default async ({ req, res, log }) => {

    try {

    log('Request Body:', req.body);

    const { documentId, userEmail } = req.body;

    if (!documentId || !userEmail) {
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
        Return a valid JSON object with fields: fromLocation, toLocation, departureDate, arrivalDate, passengers, ticketPrice, airline. Do not include any explanation or additional text.`;
        

        const completion = await hf.textGeneration({
            model: 'mistralai/Mistral-7B-Instruct-v0.2',
            inputs: prompt,
            parameters: { max_new_tokens: 200 }
        });
    
        log('AI Response:', completion); 
        
        return res.json({ ok: true, aiResponse: completion }, 200, 
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
