/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const getUserByEmail = functions.https.onRequest(async (request, response) => {
  try {
    const email = "chisholm@crewxi.com";
    const user = await admin.auth().getUserByEmail(email);
    response.json({uid: user.uid});
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({error: "Failed to get user"});
  }
});
