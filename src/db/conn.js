const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost:27017/react-practice-app-e-comm').then(() => {
//     console.log('Connected DB');
// });
mongoose.set('strictQuery', false);


mongoose.connect('mongodb+srv://ashuramajestic:ashuramajestic@dashboard0.vxeivwn.mongodb.net/?retryWrites=true&w=majority&appName=DashBoard0', {
    useUnifiedTopology: true
}).then(() => {
    console.log("Connection Created");
}).catch((err) => {
    console.log("Error: " + err);
});