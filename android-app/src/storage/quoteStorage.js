import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialQuotes } from '../data/appData';

const QUOTES_KEY = 'orcafacil.quotes.v1';
const SEED_KEY = 'orcafacil.seeded.v1';

export async function loadQuotes() {
  const saved = await AsyncStorage.getItem(QUOTES_KEY);
  if (saved) return JSON.parse(saved);

  const seeded = await AsyncStorage.getItem(SEED_KEY);
  if (seeded) return [];

  await AsyncStorage.multiSet([
    [QUOTES_KEY, JSON.stringify(initialQuotes)],
    [SEED_KEY, 'true'],
  ]);
  return initialQuotes;
}

export async function saveQuotes(quotes) {
  await AsyncStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

export async function clearQuotes() {
  await AsyncStorage.multiSet([
    [QUOTES_KEY, JSON.stringify([])],
    [SEED_KEY, 'true'],
  ]);
  return [];
}
