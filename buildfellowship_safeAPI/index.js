const express = require('express');
const cors = require('cors');
const app1 = express();
app1.use(cors());
// const firebaseConfig = {
//   // Your Firebase configuration
// };
// const app = initializeApp(firebaseConfig);
// const appCheck = AppCheck.getInstance();
// appCheck.activate('YOUR_APP_CHECK_SECRET_HERE', new ReCaptchaV3Provider());
// Serve the login page
app1.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html');
})
app1.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
const PORT = process.env.PORT || 3000; // Use the port specified in environment variable or 3000 by default
app1.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});