const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioBuffer) {
    try {
        // Save buffer to a temporary file
        const tempFilePath = path.join(__dirname, "temp_audio.mp3");
        fs.writeFileSync(tempFilePath, audioBuffer);

        // Send file to OpenAI Whisper API
        const response = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),  // Read the file as a stream
            model: "whisper-1"
        });

        // Clean up the temp file
        fs.unlinkSync(tempFilePath);

        return response.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        throw error;
    }
}

module.exports = { transcribeAudio };
