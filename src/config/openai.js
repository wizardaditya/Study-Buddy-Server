const OpenAI = require("openai");
const env = require("./env");

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

module.exports = { openai, OPENAI_MODEL: env.OPENAI_MODEL, OPENAI_EMBEDDING_MODEL: env.OPENAI_EMBEDDING_MODEL };
