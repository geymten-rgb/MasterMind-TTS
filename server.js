// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const fs = require('fs');

const app = express();

// If a local service-account.json exists, use it. Otherwise fall back to
// application default credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS).
let client;
const localKeyPath = path.join(__dirname, '..', 'service-account.json');
const localKeyPathAlt = path.join(__dirname, 'service-account.json');
if (fs.existsSync(localKeyPath)) {
    client = new TextToSpeechClient({ keyFilename: localKeyPath });
    console.log('Using service account credentials from', localKeyPath);
} else if (fs.existsSync(localKeyPathAlt)) {
    client = new TextToSpeechClient({ keyFilename: localKeyPathAlt });
    console.log('Using service account credentials from', localKeyPathAlt);
} else {
    client = new TextToSpeechClient();
    console.log('No local service-account.json found; using application default credentials');
}

// Middleware
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// TTS endpoint
app.post('/tts', async (req, res) => {
    const text = req.body.text;
    console.log('TTS request received:', text);

    if (!text) return res.status(400).send('Text is required');

    const request = {
        input: { text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    try {
        const [response] = await client.synthesizeSpeech(request);
        const audioBase64 = response.audioContent.toString('base64');
        res.send({ audio: audioBase64 });
    } catch (err) {
        console.error('TTS Error:', err);
        res.status(500).send('Error synthesizing speech');
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
