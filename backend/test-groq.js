const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function testGroq() {

    try {

        console.log("Checking Groq models...\n");

        const models = await groq.models.list();

        console.log("AVAILABLE MODELS:\n");

        models.data.forEach(model => {
            console.log(model.id);
        });

    } catch (error) {

        console.log("\nGROQ ERROR:\n");
        console.log(error.message);

    }

}

testGroq();