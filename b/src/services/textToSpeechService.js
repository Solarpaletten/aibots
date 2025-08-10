const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

async function speakText(text, lang = 'en') {
  try {
    // Ограничение Google TTS - 200 символов на запрос
    if (text.length > 200) {
      console.log(`Длинный текст (${text.length} символов), используем getAllAudioUrls`);

      // Получаем список URL для каждого фрагмента текста
      const audioResults = googleTTS.getAllAudioUrls(text, {
        lang,
        slow: false,
        splitPunct: ',.!?;:' // Разбиваем по знакам препинания
      });

      console.log(`Текст разбит на ${audioResults.length} частей для TTS`);

      // Скачиваем все части и сохраняем их во временные MP3 файлы
      const tempFiles = [];
      for (let i = 0; i < audioResults.length; i++) {
        const { url, shortText } = audioResults[i];
        console.log(`Обработка части #${i+1}: "${shortText.substring(0, 30)}..." (${shortText.length} символов)`);

        const tempMp3 = path.join(__dirname, '../../tmp', `speech_part_${i}_${Date.now()}.mp3`);
        tempFiles.push(tempMp3);

        const response = await axios({ method: 'GET', url, responseType: 'arraybuffer' });
        fs.writeFileSync(tempMp3, response.data);
      }

      // Объединяем все части в один файл
      const finalMp3 = path.join(__dirname, '../../tmp', `speech_combined_${Date.now()}.mp3`);
      const finalOgg = finalMp3.replace('.mp3', '.ogg');

      if (tempFiles.length === 1) {
        // Если только одна часть, просто конвертируем ее в ogg
        await new Promise((resolve, reject) => {
          ffmpeg(tempFiles[0])
            .audioCodec('libopus')
            .format('ogg')
            .on('end', resolve)
            .on('error', reject)
            .save(finalOgg);
        });
      } else {
        // Объединяем части
        const ffmpegCommand = ffmpeg();
        tempFiles.forEach(file => {
          ffmpegCommand.input(file);
        });

        await new Promise((resolve, reject) => {
          ffmpegCommand
            .on('error', reject)
            .on('end', resolve)
            .mergeToFile(finalMp3, __dirname);
        });

        // Конвертируем в ogg
        await new Promise((resolve, reject) => {
          ffmpeg(finalMp3)
            .audioCodec('libopus')
            .format('ogg')
            .on('end', resolve)
            .on('error', reject)
            .save(finalOgg);
        });
      }

      // Очищаем временные файлы
      tempFiles.forEach(file => {
        try {
          fs.unlinkSync(file);
        } catch (e) {
          console.error(`Ошибка при удалении временного файла ${file}:`, e);
        }
      });

      if (tempFiles.length > 1) {
        try {
          fs.unlinkSync(finalMp3);
        } catch (e) {
          console.error(`Ошибка при удалении временного файла ${finalMp3}:`, e);
        }
      }

      return finalOgg;
    }

    const mp3Name = `speech_${Date.now()}.mp3`;
    const oggName = mp3Name.replace('.mp3', '.ogg');
    const mp3Path = path.join(__dirname, '../../tmp', mp3Name);
    const oggPath = path.join(__dirname, '../../tmp', oggName);

    // Используем getAudioUrl для коротких текстов
    const url = googleTTS.getAudioUrl(text, { lang, slow: false });

    const response = await axios({ method: 'GET', url, responseType: 'arraybuffer' });
    fs.writeFileSync(mp3Path, response.data);

    await new Promise((resolve, reject) => {
      ffmpeg(mp3Path)
        .audioCodec('libopus')
        .format('ogg')
        .on('end', resolve)
        .on('error', reject)
        .save(oggPath);
    });

    return oggPath;
  } catch (error) {
    console.error('Ошибка при генерации аудио:', error);
    throw error;
  }
}

// Removed old speakLongText since we now use Google TTS's getAllAudioUrls directly

module.exports = { speakText };
