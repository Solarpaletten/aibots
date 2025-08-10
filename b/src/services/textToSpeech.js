
const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');
const axios = require('axios');

async function speakText(text, lang = 'en') {
  try {
    const filename = `speech_${Date.now()}.mp3`;
    const outputPath = path.join(__dirname, '../../tmp', filename);
    
    // Получаем URL для аудио через google-tts-api
    const url = googleTTS.getAudioUrl(text, {
      lang: lang,
      slow: false,
      host: 'https://translate.google.com',
    });
    
    // Скачиваем аудио файл с использованием axios
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer'
    });
    
    // Сохраняем в файл
    fs.writeFileSync(outputPath, response.data);
    
    return outputPath;
  } catch (error) {
    console.error('Ошибка при создании аудио:', error);
    throw error;
  }
}

module.exports = { speakText };
