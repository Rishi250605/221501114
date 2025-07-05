const { v4: uuidv4 } = require('uuid');

function generateShortcode() {
    return uuidv4().slice(0, 6);
}

module.exports = generateShortcode;