const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { transcribeAudio } = require('./whisperService');
const { translateText } = require('./translationService');
const { speakText } = require('./textToSpeechService');

async function trimAndSplitAudio(inputPath, chunkDir, chunkDuration = 20) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(chunkDir, { recursive: true });
    const cmd = `ffmpeg -i "${inputPath}" -f segment -segment_time ${chunkDuration} -c copy "${chunkDir}/chunk_%03d.ogg" -y`;
    exec(cmd, (err) => {
      if (err) return reject(err);
      const chunks = fs.readdirSync(chunkDir)
        .filter(f => f.endsWith('.ogg'))
        .map(f => path.join(chunkDir, f));
      resolve(chunks);
    });
  });
}

async function handleSmartVoice(bot, msg, langPair, tmpDir) {
  const chatId = msg.chat.id;
  const fileId = msg.voice.file_id;
  const botToken = bot.token || process.env.TELEGRAM_BOT_TOKEN;

  const waitMsg = await bot.sendMessage(chatId, '⏳ Обрабатываю длинное голосовое сообщение, пожалуйста подождите...');

  const file = await bot.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
  const inputPath = path.join(tmpDir, `${fileId}.ogg`);
  const chunkDir = path.join(tmpDir, `${fileId}_chunks`);

  // Скачиваем файл
  const axios = require('axios');
  const response = await axios({ method: 'GET', url: fileUrl, responseType: 'stream' });
  const writer = fs.createWriteStream(inputPath);
  response.data.pipe(writer);
  await new Promise((res, rej) => {
    writer.on('finish', res);
    writer.on('error', rej);
  });

  // Нарезка на чанки
  const chunks = await trimAndSplitAudio(inputPath, chunkDir, 20);
  let fullTranscript = '';

  for (let i = 0; i < chunks.length; i++) {
    const text = await transcribeAudio(chunks[i], langPair.source);
    fullTranscript += text.trim() + ' ';
  }

  fullTranscript = fullTranscript.trim();
  const translated = await translateText(fullTranscript, langPair.source, langPair.target);
  const audioPath = await speakText(translated, langPair.target);

  await bot.deleteMessage(chatId, waitMsg.message_id);

  await bot.sendMessage(chatId,
    `🧠 Распознанный текст:\n"${fullTranscript}"\n\n` +
    `${langPair.emoji.to} Перевод:\n"${translated}"`
  );
  await bot.sendAudio(chatId, audioPath, {
    caption: `🔊 Озвучка перевода на ${getLanguageName(langPair.target)}`
  });

  // Чистим
  fs.rmSync(chunkDir, { recursive: true, force: true });
  fs.unlinkSync(inputPath);
}

function getLanguageName(langCode) {
  const names = {
    'de': 'немецком',
    'ru': 'русском',
    'cs': 'чешском',
    'pl': 'польском',
    'en': 'английском',
    'kz': 'казахском'
  };
  return names[langCode] || langCode;
}

module.exports = { handleSmartVoice };
