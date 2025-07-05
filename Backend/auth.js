const axios = require('axios');
const { setAccessToken } = require('./middleware/logger');

async function authenticateLogger() {
    try {
        const response = await axios.post('http://20.244.56.144/evaluation-service/auth', {
            
            email: "221501114@rajalakshmi.edu.in",
            name: "rishi",
            rollNo: "221501114",
            accessCode: "cWyaXW",
            clientID: "1fa49cbf-9bde-4a2b-85a0-9d026a03472f",
            clientSecret: "aCfGeWbsvtCytNYx"

        });

        const token = response.data.access_token;
        setAccessToken(token);
        console.log("Logging Middleware Authenticated");
    } catch (err) {
        console.error("Failed to authenticate logging middleware:", err.message);
    }
}

module.exports = authenticateLogger;