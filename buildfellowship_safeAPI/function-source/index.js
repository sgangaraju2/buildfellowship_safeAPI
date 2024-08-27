const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Create Express app
const app = express();

// Use CORS middleware
app.use(cors({ origin: true })); 


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

exports.function1 = functions.https.onRequest(app);

// Create a custom Axios instance with session headers
const axiosWithSession = axios.create({
  headers: {
    "X-Firebase-AppCheck": "",
  },
});

// Define the login route
app.post("/login", async (req, res) => {
  try {
    // Get the App Check token from the request header
    const appCheckToken = req.header("X-Firebase-AppCheck");

    if (!appCheckToken) {
      return res.status(401).send("App Check token is missing");
    }

    // Verify the App Check token
    await admin.appCheck().verifyToken(appCheckToken);

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    const firebaseApiKey = "XXXX";
    const verifyPasswordUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${firebaseApiKey}`;

    // Send request to Firebase Authentication API
    const response = await axiosWithSession.post(
      verifyPasswordUrl,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      },
      {
        headers: {
          "X-Firebase-AppCheck": appCheckToken,
        }
      }
    );

    console.log("Response from Firebase Auth:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error verifying user:", error);

    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;

    console.error("Detailed error response:", error.response?.data);

    res.status(statusCode).send(`Error verifying user: ${message}`);
  }
});

// Check if the app is running in a Cloud Function environment
if (!process.env.FUNCTION_NAME) {
  // If not, listen on the provided port (or default to 8080)
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}


// Export the Express app as a Cloud Function
