const API_URL = 'https://pokeapi.co/api/v2';

export const typeTranslations: Record<string, string> = {
  normal: 'normal', fire: 'fogo', water: 'água', electric: 'elétrico',
  grass: 'planta', ice: 'gelo', fighting: 'lutador', poison: 'venenoso',
  ground: 'terra', flying: 'voador', psychic: 'psíquico', bug: 'inseto',
  rock: 'pedra', ghost: 'fantasma', dragon: 'dragão', dark: 'sombrio',
  steel: 'aço', fairy: 'fada'
};

export const statTranslations: Record<string, string> = {
  'HP': 'HP', 'ATTACK': 'ATAQUE', 'DEFENSE': 'DEFESA', 
  'SPECIAL-ATTACK': 'ATQ. ESP.', 'SPECIAL-DEFENSE': 'DEF. ESP.', 'SPEED': 'VELO.'
};

export interface PokemonPreview {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonPreview[];
}

const safeGetCache = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
};

const safeSetCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
};

export const fetchPokemonList = async (limit = 20, offset = 0): Promise<PokemonListResponse> => {
  const cacheKey = `poke_list_${limit}_${offset}`;
  const cached = safeGetCache(cacheKey);
  if (cached && cached.results) return cached;

  const res = await fetch(`${API_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch pokemon list');
  const data = await res.json();
  safeSetCache(cacheKey, data);
  return data;
};

export const fetchPokemonDetails = async (nameOrId: string | number) => {
  const cacheKey = `poke_details_${nameOrId}`;
  const cached = safeGetCache(cacheKey);
  if (cached && cached.name) return cached;

  const res = await fetch(`${API_URL}/pokemon/${nameOrId}`);
  if (!res.ok) throw new Error('Pokemon not found');
  const data = await res.json();
  safeSetCache(cacheKey, data);
  return data;
};

export const fetchPokemonSpecies = async (nameOrId: string | number) => {
  const cacheKey = `poke_species_${nameOrId}`;
  const cached = safeGetCache(cacheKey);
  if (cached && cached.flavor_text_entries) return cached;

  const res = await fetch(`${API_URL}/pokemon-species/${nameOrId}`);
  if (!res.ok) throw new Error('Species not found');
  const data = await res.json();
  safeSetCache(cacheKey, data);
  return data;
};

export const fetchEvolutionChain = async (url: string) => {
  const cacheKey = `poke_evo_${url}`;
  const cached = safeGetCache(cacheKey);
  if (cached && cached.chain) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Evolution chain not found');
  const data = await res.json();
  safeSetCache(cacheKey, data);
  return data;
};

export const translateToPT = async (text: string): Promise<string> => {
  try {
    const cleanText = text.replace(/[\n\f\r]/g, ' ').trim();
    const cacheKey = `trans_${cleanText.substring(0, 15)}`;
    
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;
    } catch(e) {}

    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=en|pt-BR`);
    const data = await res.json();
    const translated = data.responseData?.translatedText;
    
    if (translated && !translated.includes("MYMEMORY WARNING")) {
      try { localStorage.setItem(cacheKey, translated); } catch(e) {}
      return translated;
    }
    return cleanText;
  } catch (error) {
    return text.replace(/[\n\f\r]/g, ' '); 
  }
};
