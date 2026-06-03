const env = require("./env");

let openai = null;

if (env.OPENAI_API_KEY) {
  const OpenAI = require("openai");
  openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  console.log("✅ OpenAI configured:", env.OPENAI_MODEL);
} else {
  console.warn("⚠️  OPENAI_API_KEY not set — Aura AI will not work");
}

module.exports = {
  openai,
  OPENAI_MODEL: env.OPENAI_MODEL,
  OPENAI_EMBEDDING_MODEL: env.OPENAI_EMBEDDING_MODEL,
};
