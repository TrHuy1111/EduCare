// src/firebaseAdmin.js
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const serviceAccountJson = require('../serviceAccountKey.json'); // CommonJS style

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountJson)
  });
}

module.exports = admin;
