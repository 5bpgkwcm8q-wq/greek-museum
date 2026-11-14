import { getExhibit } from './api.js';

const id = new URLSearchParams(location.search).get('id');
const box = document.getElementById('content');

// Полный словарь для перевода (тот же, что в каталоге)
const translateDict = {
  'Terracotta': 'Терракота',
  'Marble': 'Мрамор',
  'Bronze': 'Бронза',
  'Gold': 'Золото',
  'Silver': 'Серебро',
  'Glass': 'Стекло',
  'Wood': 'Дерево',
  'Ivory': 'Слоновая кость',
  'Limestone': 'Известняк',
  'Faience': 'Фаянс',
  'Archaic': 'Архаика',
  'Classical': 'Классика',
  'Hellenistic': 'Эллинизм',
  'ca.': 'ок.',
  'BCE': 'до н.э.',
  'CE': 'н.э.',
  'century': 'век',
  'late': 'поздний',
  'early': 'ранний',
  'mid': 'середина',
  '3rd': '3-й',
  '4th': '4-й',
  '5th': '5-й',
  '6th': '6-й',
  'Cup': 'Чаша',
  'Bowl': 'Миска',
  'Jug': 'Кувшин',
  'Vase': 'Ваза',
  'Amphora': 'Амфора',
  'Lekythos': 'Лекиф',
  'Kylix': 'Килик',
  'Statue': 'Статуя',
  'Head': 'Голова',
  'Figurine': 'Фигурка',
  'Fragment': 'Фрагмент',
  'Handle': 'Ручка',
  'Lid': 'Крышка',
  'Plate': 'Тарелка',
  'Oil Lamp': 'Масляная лампа',
  'Coin': 'Монета',
  'Ring': 'Кольцо',
  'Necklace': 'Ожерелье',
  'Spouted': 'с носиком',
  'Megarian': 'Мегарская',
  'Pyxis': 'Пиксида',
  'Oinochoe': 'Энохоя',
  'Hydria': 'Гидра',
  'Krater': 'Кратер',
  'Kantharos': 'Канфар',
  'Skyphos': 'Скифос',
  'Alabastron': 'Алабастр',
  'Aryballos': 'Арибалл',
  'Stamnos': 'Стамнос',
  'Pelike': 'Пелика',
  'Askoi': 'Аскос',
  'Guttus': 'Гуттус',
  'Rhyton': 'Ритон',
  'Phiale': 'Филла',
  'Black-figure': 'Чернофигурный',
  'Red-figure': 'Краснофигурный',
  'White-ground': 'Белофонный',
  'Cypro-Archaic': 'Кипро-Архаика',
  'Cypriot': 'Кипрский',
  'Greece': 'Греция',
  'Greek': 'Греческий',
  'Roman': 'Римский',
  'Egyptian': 'Египетский',
  'New York': 'Нью-Йорк'
};

function translateText(text) {
  if (!text) return '—';
  let translated = text;
  const sortedKeys = Object.keys(translateDict).sort((a, b) => b.length - a.length);
  
  for (const en of sortedKeys) {
    const ru = translateDict[en];
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, (match) => {
      if (match === match.toUpperCase()) return ru.toUpperCase();
      if (match[0] === match[0].toUpperCase()) return ru.charAt(0).toUpperCase() + ru.slice(1);
      return ru;
    });
  }
  return translated;
}

async function init() {
  if (!id) { 
    box.innerHTML = '<p style="text-align:center; color: #888;">Экспонат не найден (нет ID)</p>'; 
    return; 
  }
  
  box.innerHTML = '<div class="skeleton" style="height: 600px; width: 100%;"></div>';

  try {
    const it = await getExhibit(id);
    if (!it || !it.objectID) throw new Error("Экспонат не найден в базе музея");

    const titleRu = translateText(it.title) || 'Без названия';
    document.title = `${titleRu} — Древнегреческий музей`;
    
    // Ссылка на Википедию (оставляем английскую, так как статей на русском может не быть)
    const wikiSearch = encodeURIComponent(it.title + ' ' + (it.culture || 'Ancient Greece'));
    const wikiLink = `https://en.wikipedia.org/wiki/Special:Search?search=${wikiSearch}`;
    const imgSrc = it.primaryImage || 'https://via.placeholder.com/600x800?text=Image+Not+Available';

    box.innerHTML = `
      <div class="exhibit-layout">
        <div class="exhibit-image">
          <img src="${imgSrc}" alt="${titleRu}">
        </div>
        <div class="exhibit-info">
          <h1 class="exhibit-title">${titleRu}</h1>
          
          <dl>
            <dt>Дата создания</dt><dd>${translateText(it.objectDate)}</dd>
            <dt>Эпоха / Период</dt><dd>${translateText(it.period)}</dd>
            <dt>Культура</dt><dd>${translateText(it.culture)}</dd>
            <dt>Материал</dt><dd>${translateText(it.medium)}</dd>
            <dt>Место находки</dt><dd>${translateText(it.findspot)}</dd>
            <dt>Музей</dt><dd>${translateText(it.repository)}</dd>
          </dl>

          ${it.creditLine ? `<p style="color: var(--text-muted); font-style: italic; margin-bottom: 30px;">${it.creditLine}</p>` : ''}
          
          <a href="${wikiLink}" target="_blank" rel="noopener" class="btn">
            Читать в Википедии ↗
          </a>
        </div>
      </div>
    `;
  } catch (e) {
    box.innerHTML = `
      <div style="text-align:center; margin-top: 100px;">
        <h2 style="font-size: 2rem; margin-bottom: 20px;">Ошибка</h2>
        <p style="color: var(--text-muted); margin-bottom: 30px;">${e.message}</p>
        <a href="catalog.html" class="btn">Вернуться в каталог</a>
      </div>
    `;
  }
}
init();