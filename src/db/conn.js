const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/react-practice-app-e-comm').then(() => {
    console.log('Connected DB');
});