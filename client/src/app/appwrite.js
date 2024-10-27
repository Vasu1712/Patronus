import { Client, Account, Databases, Functions, ID } from 'appwrite';
import dotenv from 'dotenv';
dotenv.config();

export const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID); 

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);
export {ID};

