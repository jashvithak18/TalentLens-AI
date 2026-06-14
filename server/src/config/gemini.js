const { GoogleGenerativeAI } = require('@google/generative-ai');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not defined. AI features will run in mock/fallback mode.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

const getModel = (modelName = 'gemini-1.5-flash') => {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({ model: modelName });
};

module.exports = { getGeminiClient, getModel };
