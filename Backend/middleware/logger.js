const axios = require('axios');

let accessToken = null;

function setAccessToken(token) {
    accessToken = token;
}

async function Log(stack, level, pkg, message) {
    if (!accessToken) return;

    try {
        await axios.post('http://20.244.56.144/evaluation-service/logs', {
            stack: stack.toLowerCase(),
            level: level.toLowerCase(),
            package: pkg.toLowerCase(),
            message
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    } catch (err) {
        console.error("Log API Error:", err.message);
    }
}

function loggingMiddleware(req, res, next) {
    Log("backend", "info", "route", `Received ${req.method} ${req.originalUrl}`);
    next();
}

module.exports = {
    loggingMiddleware,
    Log,
    setAccessToken
};