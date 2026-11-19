import type { City } from '../types';

/** Обласні центри та великі міста України (координати центру міста) */
export const CITIES: City[] = [
  { id: 'kyiv', name: 'Київ', region: 'м. Київ', lat: 50.4501, lon: 30.5234, population: 2950 },
  { id: 'kharkiv', name: 'Харків', region: 'Харківська обл.', lat: 49.9935, lon: 36.2304, population: 1420 },
  { id: 'odesa', name: 'Одеса', region: 'Одеська обл.', lat: 46.4825, lon: 30.7233, population: 1010 },
  { id: 'dnipro', name: 'Дніпро', region: 'Дніпропетровська обл.', lat: 48.4647, lon: 35.0462, population: 970 },
  { id: 'lviv', name: 'Львів', region: 'Львівська обл.', lat: 49.8397, lon: 24.0297, population: 720 },
  { id: 'zaporizhzhia', name: 'Запоріжжя', region: 'Запорізька обл.', lat: 47.8388, lon: 35.1396, population: 710 },
  { id: 'kryvyi-rih', name: 'Кривий Ріг', region: 'Дніпропетровська обл.', lat: 47.9105, lon: 33.3918, population: 600 },
  { id: 'mykolaiv', name: 'Миколаїв', region: 'Миколаївська обл.', lat: 46.975, lon: 31.9946, population: 470 },
  { id: 'vinnytsia', name: 'Вінниця', region: 'Вінницька обл.', lat: 49.2331, lon: 28.4682, population: 370 },
  { id: 'poltava', name: 'Полтава', region: 'Полтавська обл.', lat: 49.5883, lon: 34.5514, population: 280 },
  { id: 'chernihiv', name: 'Чернігів', region: 'Чернігівська обл.', lat: 51.4982, lon: 31.2893, population: 280 },
  { id: 'kherson', name: 'Херсон', region: 'Херсонська обл.', lat: 46.6354, lon: 32.6169, population: 280 },
  { id: 'cherkasy', name: 'Черкаси', region: 'Черкаська обл.', lat: 49.4444, lon: 32.0598, population: 270 },
  { id: 'khmelnytskyi', name: 'Хмельницький', region: 'Хмельницька обл.', lat: 49.4229, lon: 26.9871, population: 275 },
  { id: 'chernivtsi', name: 'Чернівці', region: 'Чернівецька обл.', lat: 48.2921, lon: 25.9358, population: 265 },
  { id: 'zhytomyr', name: 'Житомир', region: 'Житомирська обл.', lat: 50.2547, lon: 28.6587, population: 260 },
  { id: 'sumy', name: 'Суми', region: 'Сумська обл.', lat: 50.9077, lon: 34.7981, population: 255 },
  { id: 'rivne', name: 'Рівне', region: 'Рівненська обл.', lat: 50.6199, lon: 26.2516, population: 245 },
  { id: 'ivano-frankivsk', name: 'Івано-Франківськ', region: 'Івано-Франківська обл.', lat: 48.9226, lon: 24.7111, population: 240 },
  { id: 'kropyvnytskyi', name: 'Кропивницький', region: 'Кіровоградська обл.', lat: 48.5079, lon: 32.2623, population: 220 },
  { id: 'ternopil', name: 'Тернопіль', region: 'Тернопільська обл.', lat: 49.5535, lon: 25.5948, population: 225 },
  { id: 'lutsk', name: 'Луцьк', region: 'Волинська обл.', lat: 50.7472, lon: 25.3254, population: 215 },
  { id: 'bila-tserkva', name: 'Біла Церква', region: 'Київська обл.', lat: 49.7968, lon: 30.1311, population: 205 },
  { id: 'uzhhorod', name: 'Ужгород', region: 'Закарпатська обл.', lat: 48.6208, lon: 22.2879, population: 115 },
];

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(CITIES.map((c) => [c.id, c]));
