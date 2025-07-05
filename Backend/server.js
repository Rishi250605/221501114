const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect('mongodb://localhost:27017/urlshortener')
    .then(() => {
        app.listen(3000, () => console.log('Server running on port 3000'));
    })
    .catch(err => console.error(err));