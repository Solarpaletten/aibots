const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();


async function transcribeAudio(filePath) {
  const apiKey = process.env.OPENAI_API_KEY;

  const fileStream = fs.createReadStream(filePath);
  const formData = new FormData();
  formData.append('file', fileStream);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'text');

  const headers = {
    ...formData.getHeaders(),
    Authorization: `Bearer ${apiKey}`,
  };

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка OpenAI Whisper API:', error.response?.data || error.message);
    throw new Error('Не удалось выполнить транскрипцию');
  }
}

module.exports = { transcribeAudio };
