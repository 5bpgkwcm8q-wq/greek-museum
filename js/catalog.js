import { getGreekIds, getBatch } from './api.js';

let allIds = [];
let offset = 0;
const PAGE = 24;
let loadedItems = [];

const grid = document.getElementById('grid');
const moreBtn = document.getElementById('more');

// МАКСИМАЛЬНО ПОЛНЫЙ СЛОВАРЬ
const translateDict = {
  'Terracotta': 'Терракота', 'Marble': 'Мрамор', 'Bronze': 'Бронза', 'Gold': 'Золото',
  'Silver': 'Серебро', 'Glass': 'Стекло', 'Wood': 'Дерево', 'Ivory': 'Слоновая кость',
  'Limestone': 'Известняк', 'Faience': 'Фаянс', 'Archaic': 'Архаика', 'Classical': 'Классика',
  'Hellenistic': 'Эллинизм', 'Cypro-Archaic': 'Кипро-Архаика', 'ca.': 'ок.', 'BCE': 'до н.э.',
  'CE': 'н.э.', 'century': 'век', 'late': 'поздний', 'early': 'ранний', 'mid': 'середина',
  '3rd': '3-й', '4th': '4-й', '5th': '5-й', '6th': '6-й', 'Cup': 'Чаша', 'Bowl': 'Миска',
  'Jug': 'Кувшин', 'JUG': 'КУВШИН', 'Vase': 'Ваза', 'Amphora': 'Амфора', 'Lekythos': 'Лекиф',
  'Kylix': 'Килик', 'Statue': 'Статуя', 'Head': 'Голова', 'Figurine': 'Фигурка', 'Fragment': 'Фрагмент',
  'Handle': 'Ручка', 'Lid': 'Крышка', 'Plate': 'Тарелка', 'Oil Lamp': 'Масляная лампа',
  'Coin': 'Монета', 'Ring': 'Кольцо', 'Necklace': 'Ожерелье', 'Spouted': 'с носиком',
  'Megarian': 'Мегарская', 'Pyxis': 'Пиксида', 'Cosmetic Box': 'Косметическая шкатулка',
  'Oinochoe': 'Энохоя', 'Hydria': 'Гидра', 'Krater': 'Кратер', 'Kantharos': 'Канфар',
  'Skyphos': 'Скифос', 'Alabastron': 'Алабастр', 'Aryballos': 'Арибалл', 'Stamnos': 'Стамнос',
  'Pelike': 'Пелика', 'Askoi': 'Аскос', 'Guttus': 'Гуттус', 'Rhyton': 'Ритон', 'Phiale': 'Филла',
  'Black-figure': 'Чернофигурный', 'Red-figure': 'Краснофигурный', 'White-ground': 'Белофонный',
  'of': 'из', 'a': '', 'an': '', 'the': '', 'with': 'с', 'and': 'и', 'in': 'в', 'on': 'на',
  'from': 'из', 'for': 'для', 'by': 'от', 'to': 'к'
};

function translateText(text) {
  if (!text) return '';
  let translated = text;
  const sortedKeys = Object.keys(translateDict).sort((a, b) => b.length - a.length);
  for (const en of sortedKeys) {
    const ru = translateDict[en];
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, (match) => {
      if (!ru) return ''; 
      if (match === match.toUpperCase()) return ru.toUpperCase();
      if (match[0] === match[0].toUpperCase()) return ru.charAt(0).toUpperCase() + ru.slice(1);
      return ru;
    });
  }
  translated = translated.replace(/\s+/g, ' ').replace(/\(\s*\)/g, '').trim();
  return translated;
}

function showSkeletons(count) {
  grid.innerHTML = Array(count).fill('<div class="skeleton"></div>').join('');
}

async function init() {
  try {
    showSkeletons(8);
    allIds = await getGreekIds();
    await loadMore();
  } catch (e) {
    grid.innerHTML = '<p style="grid-column:1/-1; color: #888;">Ошибка загрузки.</p>';
  }
}

async function loadMore() {
  moreBtn.disabled = true;
  moreBtn.textContent = "Загрузка...";
  if (offset > 0) showSkeletons(8); 
  const items = await getBatch(allIds, PAGE, offset);
  offset += PAGE;
  loadedItems.push(...items);
  render();
  moreBtn.disabled = false;
  moreBtn.textContent = "Показать ещё";
  moreBtn.hidden = offset >= allIds.length;
}

function render() {
  const q = document.getElementById('search').value.toLowerCase();
  const era = document.getElementById('era').value;

  const filtered = loadedItems.filter(it => {
    const titleEn = (it.title || '').toLowerCase();
    const titleRu = translateText(it.title).toLowerCase();
    const matchName = titleEn.includes(q) || titleRu.includes(q);
    const matchEra = !era || (it.period || '').includes(era);
    return matchName && matchEra;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; color: #888;">Ничего не найдено.</p>';
    return;
  }

  grid.innerHTML = filtered.map(it => {
    const dateRu = translateText(it.objectDate);
    const mediumRu = translateText(it.medium);
    const titleRu = translateText(it.title) || 'Без названия';

    return `
      <a class="card" href="exhibit.html?id=${it.objectID}">
        <img src="${it.primaryImageSmall}" alt="${titleRu}" loading="lazy">
        <div class="card-info">
          <h3>${titleRu}</h3>
          <p>${dateRu}</p>
          ${mediumRu ? `<p><em style="font-size: 0.8rem; opacity: 0.7;">${mediumRu}</em></p>` : ''}
        </div>
      </a>
    `;
  }).join('');
}

document.getElementById('search').addEventListener('input', render);
document.getElementById('era').addEventListener('change', render);
moreBtn.addEventListener('click', loadMore);

// ПРОВЕРКА ССЫЛКИ НА ЭПОХУ ИЗ ТАЙМЛАЙНА
const urlParams = new URLSearchParams(window.location.search);
const eraParam = urlParams.get('era');
if (eraParam) {
  const selectEra = document.getElementById('era');
  if (selectEra) {
    selectEra.value = eraParam;
  }
}

init();