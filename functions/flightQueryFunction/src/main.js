import { HfInference } from '@huggingface/inference';
import { Client, Databases, Messaging, Users, Account } from 'node-appwrite';
import { ID } from 'appwrite';
import dotenv from 'dotenv';
dotenv.config();

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
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const account = new Account(client);
       
        const document = await databases.getDocument(
            process.env.APPWRITE_DATABASE_ID, 
            process.env.APPWRITE_COLLECTION_ID, 
            documentId
        );

        log('Fetched document:', document); 

        const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);
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
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title></title>
            
                <style type="text/css">   
                        @media only screen and (min-width: 620px) {
                            .u-row {
                            width: 600px !important;
                            }

                            .u-row .u-col {
                            vertical-align: top;
                            }

                            
                                .u-row .u-col-100 {
                                width: 600px !important;
                                }
                            
                        }

                        @media only screen and (max-width: 620px) {
                            .u-row-container {
                            max-width: 100% !important;
                            padding-left: 0px !important;
                            padding-right: 0px !important;
                            }

                            .u-row {
                            width: 100% !important;
                            }

                            .u-row .u-col {
                            display: block !important;
                            width: 100% !important;
                            min-width: 320px !important;
                            max-width: 100% !important;
                            }

                            .u-row .u-col > div {
                            margin: 0 auto;
                            }


                            .u-row .u-col img {
                            max-width: 100% !important;
                            }

                    }   
                    body{margin:0;padding:0}table,td,tr{border-collapse:collapse;vertical-align:top}p{margin:0}.ie-container table,.mso-container table{table-layout:fixed}*{line-height:inherit}a[x-apple-data-detectors=true]{color:inherit!important;text-decoration:none!important}
                    table, td { color: #000000; } #u_body a { color: #0000ee; text-decoration: underline; } @media (max-width: 480px) { #u_row_1 .v-row-background-image--inner { background-position: center top !important; background-repeat: no-repeat !important; } #u_row_1 .v-row-background-image--outer { background-position: center top !important; background-repeat: no-repeat !important; } #u_row_1.v-row-background-image--outer { background-position: center top !important; background-repeat: no-repeat !important; } #u_content_heading_1 .v-container-padding-padding { padding: 50px 10px 10px !important; } #u_content_heading_1 .v-font-size { font-size: 40px !important; } #u_content_text_1 .v-container-padding-padding { padding: 0px 20px 10px !important; } #u_content_text_2 .v-container-padding-padding { padding: 10px !important; } #u_content_heading_2 .v-container-padding-padding { padding: 0px 10px 10px !important; } #u_content_heading_2 .v-font-size { font-size: 28px !important; } #u_content_text_10 .v-container-padding-padding { padding: 0px 10px 20px !important; } #u_content_heading_6 .v-container-padding-padding { padding: 30px 20px 10px !important; } #u_content_heading_6 .v-text-align { text-align: center !important; } #u_content_social_1 .v-container-padding-padding { padding: 4px 0px 10px !important; } #u_content_text_11 .v-container-padding-padding { padding: 10px 10px 30px !important; } #u_content_text_12 .v-container-padding-padding { padding: 10px 10px 30px !important; } }

                    .boarding-pass {
                        background-color: #f0f4ff;
                        border-radius: 20px;
                        font-family: 'Ubuntu', sans-serif;
                        min-width: 40vw;
                        margin: 0 auto;
                        color: #000;
                    }
                    
                    .row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px; 
                        position: relative;
                        height: 100%; 
                        
                    }
                    
                    .boarding-pass-left {
                        width: 60%; /* Adjust width for columns */
                        border-right: 1px dashed #dbdfff; /* Add dashed vertical line */
                        
                    }

                    .boarding-pass-left-inside {
                        width: 90%;
                        padding: 1rem;
                    }
                    
                    .boarding-pass-right {
                        width: 40%; /* Adjust width for columns */
                    }

                    .boarding-pass-right-inside {
                        width: 90%;
                        padding: 1rem;
                    }
                    
                    .boarding-pass-header-left {
                        background-color: #4b6afe;
                        color: white;
                        padding-top: 1em;
                        border-top-left-radius: 20px;
                        text-align: center;
                        height: 3rem;
                    } 
                    
                    .boarding-pass-header-right {
                        background-color: #4b6afe;
                        color: white;
                        padding-top: 1em;
                        border-top-right-radius: 20px;
                        text-align: center;
                        height: 3rem;
                    }
                    
                    .boarding-pass-header-left p {
                        font-size: 24px;
                        font-weight: bold;
                    }
                    
                    .boarding-pass-header-right p {
                        font-size: 20px;
                    }
                    
                    .boarding-pass-main {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .boarding-pass-main .from,
                    .boarding-pass-main .to {
                        text-align: center;
                    }
                    
                    .from-location-code, 
                    .to-location-code {
                        color: #5b71df;
                        font-size: 1.5em;
                        font-weight:bolder;
                    }

                    .from-location, 
                    .to-location {
                        color: #a2ade9;
                        font-size: medium;
                        text-transform: capitalize;
                    }

                    .flight-takeoff-date-time,
                    .flight-landing-date-time {
                        color: #191919;
                        font-size: small;
                        text-align: left;
                    }
                    
                    .boarding-pass-main .flight-info {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        color: #5b71df;
                    }
                    
                    .boarding-pass-main .flight-info span {
                        font-size: 12px;
                        color: #999;
                    }
                    
                    .boarding-pass-details {
                        display: flex;
                        justify-content: space-between;
                        padding-top: 1em;
                    }
                    
                    .boarding-pass-details .section {
                        text-align: left;
                    }
                    
                    
                    .boarding-pass-details .section p {
                        font-size: 1.1em;
                        color: #666;
                        font-weight: 600;

                    }
                    
                    .info-passenger {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;

                    }
                    .passenger-name, .passenger-class {
                        font-weight: 400;

                    }
                    .passenger-name-main, .passenger-class-main {
                        font-weight: 700;
                        color: #546ce7;
                        padding-top: 0.2em;
                    }

                    .date-time-info {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;

                    }

                    .date, .boarding-time, .departure-time { 
                        font-weight: 300;
                        font-size: small;
                        color: #191919;
                        margin-top: 1em;
                    }

                    .date-text, .boarding-time-text, .departure-time-text { 
                        font-weight: 600;
                        font-size: 1em;
                        color: #5b71df;
                        text-transform: capitalize;
                    }

                    .boarding-pass-right .price {
                        font-weight: bold;
                        font-size: 2rem;
                        color: #546ce7;
                        margin-top: 0.5em;
                        text-align: right;
                    }
                    .h-line {
                        border: none;
                        border-top: 2px solid #bcc8ff;
                        margin-top: 1em;
                    }
                    .h-line-right {
                        border: none;
                        border-top: 2px solid #bcc8ff;
                        margin-top: 0.25em;
                    }
                    
                </style>
            
            <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300,400,700&display=swap" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css?family=Raleway:400,700&display=swap" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css2?family=Arvo&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->

            </head>

            <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #e7e7e7;color: #000000">
            <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #e7e7e7;width:100%" cellpadding="0" cellspacing="0">
            <tbody>
            <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                
            <div id="u_row_1" class="u-row-container v-row-background-image--outer" style="padding: 0px;background-color: #191919">
            <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                <div class="v-row-background-image--inner" style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
            <div style="height: 100%;width: 100% !important;">
                <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
            
            <table style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:15px 0px 0px;font-family:'Ubuntu',sans-serif;" align="left">
                    
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
                
                <img align="center" border="0" src="https://assets.unlayer.com/projects/0/1729771837726-patronusheader.png" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 40%;max-width: 240px;" width="240"/>
                
                </td>
            </tr>
            </table>

                </td>
                </tr>
            </tbody>
            </table>

            <table id="u_content_heading_1" style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:60px 50px 10px;font-family:'Ubuntu',sans-serif;" align="left">
                <h4 class="v-text-align v-font-size" style="margin: 0px; color: #ffea74; line-height: 110%; text-align: center; word-wrap: break-word; font-family: Great Vibes; font-size: 70px; font-weight: 700;"><span>Expecto Patronum!</span></h4>
                </td>
                </tr>
            </tbody>
            </table>

            <table id="u_content_text_1" style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:0px 80px 20px;font-family:'Ubuntu',sans-serif;" align="left">
                    
            <div class="v-text-align v-font-size" style="font-size: 14px; color: #ced4d9; line-height: 140%; text-align: center; word-wrap: break-word;">
                <p style="line-height: 140%;"><span style="font-size: 10px; line-height: 14px;">Here's the response to your most recent flight tickets request on the cheapest prices</span></p>
            </div>

                </td>
                </tr>
            </tbody>
            </table>

            <table style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:15px 0px 0px;font-family:'Ubuntu',sans-serif;" align="left">
                    
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
                
                <img align="center" border="0" src="https://assets.unlayer.com/projects/0/1729774702744-image%20185.png" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 60%;max-width: 360px;" width="360"/>
                
                </td>
            </tr>
            </table>

                </td>
                </tr>
            </tbody>
            </table>

            <table id="u_content_text_2" style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:47px 10px 10px;font-family:'Ubuntu',sans-serif;" align="left">
                    
            <div class="v-text-align v-font-size" style="font-size: 14px; color: #ced4d9; line-height: 140%; text-align: center; word-wrap: break-word;">
                <p style="line-height: 140%;">Here is your</p>
            </div>

                </td>
                </tr>
            </tbody>
            </table>

            <table id="u_content_heading_2" style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:0px 90px 20px;font-family:'Ubuntu',sans-serif;" align="left">

                <h1 class="v-text-align v-font-size" style="margin: 0px; color: #f9fafb; line-height: 110%; text-align: center; word-wrap: break-word; font-family: Arvo; font-size: 31px; font-weight: 400;"><span>Cheapest Flight Ticket</span></h1>
                </td>
                </tr>
            </tbody>
            </table>

            <div class="boarding-pass">
                <!-- First Row -->
                <div class="row">
                <div class="boarding-pass-left">
                    <div class="boarding-pass-header-left">
                    <p>PATRONUS</p>
                    </div>
                </div>
                <div class="boarding-pass-right">
                    <div class="boarding-pass-header-right">
                    <p>Indigo Airlines</p>
                    </div>
                </div>
                </div>
            
                <!-- Second Row -->
                <div class="row">
                <div class="boarding-pass-left">
                    <div class="boarding-pass-left-inside">
                        <div class="boarding-pass-main">
                            <div class="from">
                            <p class="from-location-code">DEL</p>
                            <p class="from-location">Delhi</p>
                            <span class="flight-takeoff-date-time">Jan 25, 2025<br>05:50 PM</span>
                            </div>
                            <div class="flight-info">
                            <img src="https://assets.unlayer.com/projects/0/1729802766034-map%20(2).png" style="width: 9em;" alt="Flight">
                            <span>Flight Number</span>
                            </div>
                            <div class="to">
                            <p class="to-location-code">BOM</p>
                            <p class="to-location">Mumbai</p>
                            <span class="flight-landing-date-time">Jan 26, 2025<br>07:20 AM</span>
                            </div>
                        </div>
                        <hr class="h-line">
                        <div class="boarding-pass-details">
                            <div class="section">
                            <p>SHYAMAL JAIN</p>
                            </div>
                            <div class="section">
                            <p>6IE764</p>
                            </div>
                        </div>
                        </div>
                    </div>
            
                <div class="boarding-pass-right">
                    <div class="boarding-pass-right-inside">
                        <div class="info-passenger">
                            <span class="passenger-name">
                                <p>Passenger</p> 
                                <p class="passenger-name-main">SHYAMAL JAIN</p>
                            </span>
                            <span class="passenger-class">
                                <p>Class</p> 
                                <p class="passenger-class-main">ECONOMY</p>
                            </span>
                        </div>
                        <hr class="h-line-right">
                        <div class="date-time-info">
                            <span>
                                <p class="date">Date </p>
                                <p class="date-text">JAN 25</p>
                            </span>
                            <span>
                                <p class="boarding-time">Boarding</p> 
                                <p class="boarding-time-text">05:20 PM</p>
                            </span>
                            <span>
                                <p class="departure-time">Departure</p>
                                <p class="departure-time-text">05:50 PM</p>
                            </span>
                        </div>
                        <hr class="h-line-right">
                        <p class="price">₹ 3500</p>
                    </div>
                </div>
                </div>
            </div>
            
            

            </div>
            </div>
            </div>
                </div>
            </div>
            </div>

            <div class="u-row-container v-row-background-image--outer" style="padding: 0px;background-color: #191919">
            <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                <div class="v-row-background-image--inner" style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
            <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
            <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
            
            <table id="u_content_text_10" style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Ubuntu',sans-serif;" align="left">
                    
            <div class="v-text-align v-font-size" style="font-size: 14px; color: #ced4d9; line-height: 140%; text-align: center; word-wrap: break-word;">
                <p style="line-height: 140%;">Hurry and get your seats reserved, time is running out !!</p>
            </div>

                </td>
                </tr>
            </tbody>
            </table>

            </div>
            </div>
            </div>
                </div>
            </div>
            </div>

            
            <div class="u-row-container v-row-background-image--outer" style="padding: 0px;background-color: #e1e2e2">
            <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                <div class="v-row-background-image--inner" style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
            <div style="background-color: #e1e2e2;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
            
            <table id="u_content_heading_6" style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:'Ubuntu',sans-serif;" align="left">
                </td>
                </tr>
            </tbody>
            </table>

            <table style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 35px;font-family:'Ubuntu',sans-serif;" align="left">
                    
            <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #000000;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                <tbody>
                <tr style="vertical-align: top">
                    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                    <span>&#160;</span>
                    </td>
                </tr>
                </tbody>
            </table>
                </td>
                </tr>
            </tbody>
            </table>

            <table id="u_content_social_1" style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Ubuntu',sans-serif;" align="left">
                    
                    <div align="center">
                    <div style="display: table; max-width:491px;">
                        <table align="center" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 50px">
                        <tbody><tr style="vertical-align: top"><td align="center" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                            <a href="https://www.linkedin.com/in/vasu-pal-300448203/" title="LinkedIn" target="_blank">
                            <img src="https://assets.unlayer.com/projects/0/1729790814473-image-3.png" alt="LinkedIn" title="LinkedIn" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                            </a>
                        </td></tr>
                        </tbody>
                        </table>

                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 50px">
                    <tbody><tr style="vertical-align: top"><td align="center" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                        <a href="https://twitter.com/VasuPal17" title="X" target="_blank">
                        <img src="https://assets.unlayer.com/projects/0/1729790750501-image-1.png" alt="X" title="X" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                        </a>
                    </td></tr>
                    </tbody>
                    </table>

                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 50px">
                    <tbody><tr style="vertical-align: top"><td align="center" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                        <a href="https://discordapp.com/vasu1712" title="Discord" target="_blank">
                        <img src="https://assets.unlayer.com/projects/0/1729790773604-image-2.png" alt="Discord" title="Discord" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                        </a>
                    </td></tr>
                    </tbody>
                    </table>

                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 50px">
                    <tbody><tr style="vertical-align: top"><td align="center" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                        <a href="https://github.com/vasu1712" title="GitHub" target="_blank">
                        <img src="https://assets.unlayer.com/projects/0/1729790927006-image-6.png" alt="GitHub" title="GitHub" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                        </a>
                    </td></tr>
                    </tbody>
                    </table>

                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 50px">
                    <tbody><tr style="vertical-align: top"><td align="center" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                        <a href="mailto:vasu.pal.ug20@nsut.ac.in" title="Email" target="_blank">
                        <img src="https://assets.unlayer.com/projects/0/1729790883155-image-5.png" alt="Email" title="Email" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                        </a>
                    </td></tr>
                    </tbody>
                    </table>

                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                    <tbody><tr style="vertical-align: top"><td align="center" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                        <a href="https://reddit.chttps://www.reddit.com/user/Heavy-Cat3771om/" title="Reddit" target="_blank">
                        <img src="https://assets.unlayer.com/projects/0/1729790843759-image-4.png" alt="Reddit" title="Reddit" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                        </a>
                    </td></tr>
                    </tbody>
                    </table>
                </div>
                </div>

                </td>
                </tr>
            </tbody>
            </table>

            <table id="u_content_text_11" style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:50px 60px 10px;font-family:'Ubuntu',sans-serif;" align="left">
                    <div class="v-text-align v-font-size" style="font-size: 14px; color: #000000; letter-spacing: 4px; line-height: 140%; text-align: center; word-wrap: break-word;">
                        <p style="line-height: 140%; text-align: center;"><strong>PATRONUS</strong></p>
                    </div>
                </td>
                </tr>
            </tbody>
            </table>

            <table id="u_content_text_12" style="font-family:'Ubuntu',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
            <tbody>
                <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 60px 20px;font-family:'Ubuntu',sans-serif;" align="left">
                    
            <div class="v-text-align v-font-size" style="font-size: 14px; color: #1b2934; letter-spacing: 1px; line-height: 150%; text-align: center; word-wrap: break-word;">
                <p style="line-height: 150%;"><span style="font-family: Raleway; line-height: 21px;"><strong>Developed by Vasu1712, powered by Appwrite </strong></span></p>
            <p style="line-height: 150%;"><span style="font-family: Raleway; line-height: 21px;"><strong>© Copyright 2024. All rights reserved.</strong></span></p>
            </div>

                </td>
                </tr>
            </tbody>
            </table>

            </div>
            </div>
                </div>
            </div>
            </div>
                </td>
            </tr>
            </tbody>
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
