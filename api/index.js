const path = require('path');
const dotenv = require('dotenv');

// Load environment variables for local testing and serverless runtime
dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = require('../server/server');

module.exports = app;
