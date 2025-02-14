require('dotenv').config();
const express = require("express")
const multer = require("multer")
const {OpenAI} = require("openai")
const { transcribeAudio } = require("./whisperService");
const { extractBibleQuote } = require("./geminiService");
const { getBibleVerse } = require("./bibleDb");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 3001;
const upload = multer();


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

// app.post("/stream-audio", upload.single("audio"), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "No audio file uploaded" });
//         }

//         // Step 1: Transcribe Audio
//         const transcription = await transcribeAudio(req.file.buffer);
//         console.log("Transcription:", transcription);

//         // Step 2: Extract Bible Quote
//         const bibleReference = await extractBibleQuote(transcription);
//         console.log("Extracted Reference:", bibleReference);

//         if (!bibleReference) {
//             return res.json({ message: "No Bible reference detected." });
//         }

//         // Step 3: Retrieve Full Bible Verse
//         const bibleVerse = await getBibleVerse(bibleReference);
//         console.log("Bible Verse:", bibleVerse);

//         return res.status(200).json({ reference: bibleReference, verse: bibleVerse });
//     } catch (error) {
//         console.error("Error processing request:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

app.post("/upload-audio", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file uploaded" });
        }

        // Step 1: Transcribe Audio
        const transcription = await transcribeAudio(req.file.buffer);
        console.log("Transcription:", transcription);

        // Step 2: Extract Bible Quote
        const bibleReference = await extractBibleQuote(transcription);
        console.log("Extracted Reference:", bibleReference);

        if (!bibleReference) {
            return res.json({ message: "No Bible reference detected." });
        }

        // Step 3: Retrieve Full Bible Verse
        const bibleVerse = await getBibleVerse(bibleReference);
        console.log("Bible Verse:", bibleVerse);

        res.json({ reference: bibleReference, verse: bibleVerse });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", async (message) => {
        try {
            const audioBuffer = Buffer.from(message);

            // Step 1: Transcribe Audio
            const transcription = await transcribeAudio(audioBuffer);
            console.log("Transcription:", transcription);

            // Step 2: Extract Bible Quote
            const bibleReference = await extractBibleQuote(transcription);
            console.log("Extracted Reference:", bibleReference);

            let response = { transcription };

            if (bibleReference) {
                // Step 3: Retrieve Full Bible Verse
                const bibleVerse = await getBibleVerse(bibleReference);
                console.log("Bible Verse:", bibleVerse);
                response = { reference: bibleReference, verse: bibleVerse };
            }

            ws.send(JSON.stringify(response));
        } catch (error) {
            console.error("Error processing audio:", error);
            ws.send(JSON.stringify({ error: "Error processing audio." }));
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});