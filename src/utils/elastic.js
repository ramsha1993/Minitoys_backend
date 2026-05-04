import dotenv from 'dotenv';
import { Client } from '@opensearch-project/opensearch';

dotenv.config();
console.log("service ", process.env.SERVICE_URI,"pass", process.env.AVN_PASSWORD)
export const client = new Client({
    node:process.env.SERVICE_URI, // Ensure this matches your .env key exactly (case-sensitive)
    auth: {
        username:process.env.AVN_ADMIN,
        password:process.env.AVN_PASSWORD, // You need to add this to your .env
    },
    ssl: {
        rejectUnauthorized: false 
    }
});












// import { Client } from '@elastic/elasticsearch';
// import dotenv from 'dotenv';

// dotenv.config();

// export const client = new Client({
//     node: 'https://my-elasticsearch-project-c27e77.es.us-central1.gcp.elastic.cloud:443',
//     auth: {
//         apiKey: process.env.API_KEY
//     }
// });

