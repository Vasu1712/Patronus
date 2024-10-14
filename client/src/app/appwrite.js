import { Client, Account, Databases, ID } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6704100e000400efea98'); 

export const account = new Account(client);
export const databases = new Databases(client);
export {ID};

