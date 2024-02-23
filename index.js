const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Translate } = require('@google-cloud/translate').v2;
require('dotenv').config();

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);


const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());


// Google translation api client
const translate = new Translate({
    credentials: CREDENTIALS,
    projectId: CREDENTIALS.project_id
});

// function for detecting language
const detectLanguage = async (text) => {
    try {
        let [response] = await translate.detect(text);
        return response;
    } catch (error) {
        throw new Error("Error occured while detecting language", { cause: error })
    }

}

// function for translating the text
const translateText = async (text, targetLanguage) => {
    try {
        let [response] = await translate.translate(text, targetLanguage);
        return response;
    } catch (error) {
        throw new Error("Error occured while translating text", {cause: error })
    }
};

app.post('/translate', async (req, res) => {
    try {
        // Check if request contains JSON data with 'text' key
        if (!req.body || !req.body.text) {
            return res.status(400).json({ error: "Invalid request body. Please provide JSON data with 'text' key." });
        }

        const text = req.body.text;
        const targetLanguage = 'fr'; // translation to French

        // Detect language
        const sourceLanguage = await detectLanguage(text);

        if (sourceLanguage.language === 'en') {

            // Translate text
            const translation = await translateText(text, targetLanguage);
            res.status(200).json({ translation: translation });
        } else {
            res.status(400).json({ error: "Text language is not English." });
        }
    } catch (error) {
        console.error(error.cause.stack);
        res.status(500).json({ error: "An error occurred. Please contact the owner of this application for assistance." || 'Server Error.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
