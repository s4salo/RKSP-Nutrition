const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.use(cors());
app.use(express.json()); // для обработки JSON тела запроса

async function translateText(text) {

  const IAM_TOKEN = 'AQVNyIKIeBxfT8iWqkURPVGRjU3cI4iTwgMChIUl';
  const target_language = 'en';

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Api-Key ${IAM_TOKEN}`
  };

  const body = {
    targetLanguageCode: target_language,
    texts: [text],
  };

  const response = await axios.post('https://translate.api.cloud.yandex.net/translate/v2/translate', body, { headers: headers })
  return response.data.translations[0].text;
}

// Маршрут для перевода текста
app.post('/translate', async (req, res) => {
  const { text } = req.body;
  try {
    const translatedText = await translateText(text); 
    res.json({ translatedText: translatedText });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при переводе текста");
  }
});

// Маршрут для получения информации о продукте
app.get('/product-info/:productName', async (req, res) => {
  const {productName} = req.params;
  try {
    const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${productName}&api_key=g0QVXoejPe9WgYlsVx7UgA3ZAbtZhdrn9HAhC6wb`);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при запросе информации о продукте");
  }
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});