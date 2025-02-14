const bibleVerses = {
    "John 3:16": "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    // Add more verses as needed
};

async function getBibleVerse(reference) {
    return bibleVerses[reference] || "Verse not found.";
}

module.exports = { getBibleVerse };