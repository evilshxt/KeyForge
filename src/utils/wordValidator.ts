let dictionaryCache: Set<string> | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export const loadDictionary = async (): Promise<Set<string>> => {
  const now = Date.now()
  if (dictionaryCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return dictionaryCache
  }

  try {
    const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words_dictionary.json')
    const data = await response.json()
    dictionaryCache = new Set(Object.keys(data))
    cacheTimestamp = now
    localStorage.setItem('keyforge:dict', JSON.stringify(data))
    localStorage.setItem('keyforge:dict:timestamp', now.toString())
    return dictionaryCache
  } catch (error) {
    console.error('Failed to load dictionary:', error)
    // Fallback to cached version if available
    const cached = localStorage.getItem('keyforge:dict')
    if (cached) {
      const data = JSON.parse(cached)
      return new Set(Object.keys(data))
    }
    throw new Error('Unable to load dictionary')
  }
}

export const isValidWord = async (word: string): Promise<boolean> => {
  const dict = await loadDictionary()
  return dict.has(word.toLowerCase())
}
