let dictionaryCache: Set<string> | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export const loadDictionary = async (): Promise<Set<string>> => {
  const now = Date.now()
  if (dictionaryCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📚 Using cached dictionary')
    return dictionaryCache
  }

  console.log('🌐 Loading dictionary from GitHub...')
  try {
    const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words_dictionary.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    dictionaryCache = new Set(Object.keys(data))
    cacheTimestamp = now

    // Only store minimal metadata in localStorage, not the entire dictionary
    localStorage.setItem('keyforge:dict:timestamp', now.toString())
    localStorage.setItem('keyforge:dict:loaded', 'true')

    console.log(`✅ Dictionary loaded successfully with ${dictionaryCache.size} words`)
    return dictionaryCache
  } catch (error) {
    console.error('❌ Failed to load dictionary from GitHub:', error)

    // Try to load from localStorage as fallback
    const cachedTimestamp = localStorage.getItem('keyforge:dict:timestamp')
    const cachedLoaded = localStorage.getItem('keyforge:dict:loaded')

    if (cachedLoaded === 'true' && cachedTimestamp) {
      const cacheAge = now - parseInt(cachedTimestamp)
      if (cacheAge < CACHE_DURATION) {
        console.log('📚 Using fallback localStorage dictionary')
        // For now, create a minimal dictionary as fallback
        dictionaryCache = new Set([
          'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'let', 'put', 'say', 'she', 'too', 'use', 'any', 'day', 'eat', 'get', 'got', 'had', 'has', 'him', 'his', 'how', 'let', 'may', 'new', 'now', 'old', 'our', 'put', 'see', 'she', 'too', 'two', 'use', 'who', 'why', 'yes', 'yet', 'you', 'end', 'man', 'men', 'own', 'run', 'sat', 'saw', 'sea', 'set', 'sit', 'sky', 'sun', 'try', 'war', 'was', 'way', 'why', 'win', 'yes', 'yet', 'ask', 'bad', 'bed', 'big', 'box', 'boy', 'car', 'cat', 'dog', 'end', 'eye', 'far', 'fun', 'hit', 'hot', 'job', 'leg', 'let', 'lot', 'low', 'man', 'map', 'may', 'mom', 'net', 'new', 'old', 'own', 'pay', 'pet', 'put', 'red', 'run', 'sat', 'saw', 'say', 'sea', 'set', 'she', 'sit', 'sky', 'son', 'sun', 'top', 'try', 'two', 'use', 'war', 'was', 'way', 'who', 'why', 'win', 'yes', 'yet'
        ])
        cacheTimestamp = now
        return dictionaryCache
      }
    }

    throw new Error('Unable to load dictionary')
  }
}

export const isValidWord = async (word: string): Promise<boolean> => {
  try {
    const dict = await loadDictionary()
    return dict.has(word.toLowerCase())
  } catch (error) {
    console.error('❌ Error validating word:', error)
    return false // Default to invalid if we can't check
  }
}

// Function for batch validation after test completion
export const validateWordsAfterTest = async (text: string): Promise<{ validWords: string[], invalidWords: string[], accuracy: number }> => {
  console.log('🔍 Starting post-test word validation...')
  const words = text.trim().split(/\s+/).filter(word => word.length > 0)
  const validWords: string[] = []
  const invalidWords: string[] = []

  try {
    const dict = await loadDictionary()

    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase()
      if (cleanWord.length > 2) { // Only validate words longer than 2 characters
        if (dict.has(cleanWord)) {
          validWords.push(word)
        } else {
          invalidWords.push(word)
        }
      } else {
        validWords.push(word) // Short words are considered valid
      }
    }

    const accuracy = words.length > 0 ? Math.round((validWords.length / words.length) * 100) : 100

    console.log('📊 Validation complete:', {
      totalWords: words.length,
      validWords: validWords.length,
      invalidWords: invalidWords.length,
      accuracy
    })

    return { validWords, invalidWords, accuracy }
  } catch (error) {
    console.error('❌ Error during batch validation:', error)
    // Return all words as valid if validation fails
    return { validWords: words, invalidWords: [], accuracy: 100 }
  }
}

/**
 * Function to get random words from dictionary for monkey mode.
 * 
 * This function loads the dictionary and selects a specified number of random words.
 * The words are chosen from a filtered list of common words (3-8 characters, no proper nouns).
 * 
 * @param count The number of random words to select (default: 80)
 * @returns A string containing the selected random words, separated by spaces
 */
export const getRandomMonkeyWords = async (count: number = 80): Promise<string> => {
  console.log('🔍 Getting random words from dictionary for monkey mode...')

  try {
    const dict = await loadDictionary()

    // Convert Set to array and filter for common words (3-8 characters, no proper nouns)
    const wordArray = Array.from(dict).filter(word => {
      const len = word.length
      return len >= 3 && len <= 8 && word === word.toLowerCase()
    })

    console.log(`📚 Found ${wordArray.length} suitable words for monkey mode`)

    // Shuffle and select words
    const selectedWords: string[] = []
    const wordsCopy = [...wordArray]

    for (let i = 0; i < count && wordsCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * wordsCopy.length)
      selectedWords.push(wordsCopy.splice(randomIndex, 1)[0])
    }

    const result = selectedWords.join(' ')
    console.log(`✅ Generated monkey mode text with ${selectedWords.length} words`)
    return result
  } catch (error) {
    console.error('❌ Error getting random words from dictionary:', error)
    console.log('🔄 Using fallback word list for monkey mode')

    // Use fallback words if dictionary fails
    const selectedWords: string[] = []
    const wordsCopy = [...FALLBACK_MONKEY_WORDS]

    for (let i = 0; i < count && wordsCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * wordsCopy.length)
      selectedWords.push(wordsCopy.splice(randomIndex, 1)[0])
    }

    const result = selectedWords.join(' ')
    console.log(`✅ Generated fallback monkey mode text with ${selectedWords.length} words`)
    return result
  }
}

const FALLBACK_MONKEY_WORDS = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'let', 'put', 'say', 'she', 'too', 'use',
  'any', 'day', 'eat', 'get', 'got', 'had', 'has', 'him', 'his', 'how', 'let', 'may', 'new', 'now', 'old', 'our', 'put', 'see', 'she', 'too', 'two', 'use', 'who', 'why', 'yes', 'yet', 'you', 'end', 'man', 'men', 'own', 'run', 'sat', 'saw', 'sea', 'set', 'sit', 'sky', 'sun', 'try', 'war', 'was', 'way', 'why', 'win', 'yes', 'yet',
  'ask', 'bad', 'bed', 'big', 'box', 'boy', 'car', 'cat', 'dog', 'end', 'eye', 'far', 'fun', 'hit', 'hot', 'job', 'leg', 'let', 'lot', 'low', 'man', 'map', 'may', 'mom', 'net', 'new', 'old', 'own', 'pay', 'pet', 'put', 'red', 'run', 'sat', 'saw', 'say', 'sea', 'set', 'she', 'sit', 'sky', 'son', 'sun', 'top', 'try', 'two', 'use', 'war', 'was', 'way', 'who', 'why', 'win', 'yes', 'yet',
  'able', 'back', 'best', 'blue', 'book', 'call', 'came', 'care', 'city', 'cold', 'come', 'dark', 'done', 'down', 'each', 'easy', 'fact', 'fall', 'fast', 'feel', 'find', 'fire', 'five', 'food', 'form', 'free', 'full', 'game', 'gave', 'girl', 'give', 'good', 'grow', 'hair', 'hand', 'hard', 'head', 'hear', 'help', 'here', 'high', 'hold', 'home', 'hope', 'hour', 'idea', 'into', 'just', 'keep', 'kind', 'king', 'know', 'land', 'last', 'late', 'lead', 'left', 'less', 'life', 'like', 'line', 'list', 'live', 'long', 'look', 'lost', 'love', 'made', 'make', 'many', 'mean', 'meet', 'mind', 'miss', 'move', 'much', 'must', 'name', 'near', 'need', 'next', 'nice', 'open', 'part', 'pass', 'past', 'pick', 'plan', 'play', 'read', 'real', 'rest', 'ride', 'room', 'rule', 'safe', 'same', 'save', 'seem', 'send', 'show', 'side', 'sign', 'sing', 'slow', 'some', 'song', 'soon', 'sort', 'stay', 'step', 'stop', 'sure', 'take', 'talk', 'tell', 'test', 'than', 'that', 'them', 'then', 'they', 'this', 'time', 'told', 'took', 'tree', 'true', 'turn', 'used', 'very', 'wait', 'walk', 'wall', 'want', 'warm', 'well', 'went', 'were', 'what', 'when', 'where', 'which', 'while', 'white', 'who', 'why', 'will', 'wind', 'wish', 'with', 'word', 'work', 'year', 'yes', 'yet', 'you', 'young',
  'about', 'after', 'again', 'air', 'along', 'also', 'always', 'animal', 'answer', 'around', 'ask', 'away', 'back', 'bad', 'bag', 'ball', 'base', 'bath', 'bear', 'bed', 'been', 'before', 'began', 'being', 'below', 'best', 'better', 'big', 'bird', 'black', 'blue', 'boat', 'body', 'book', 'both', 'box', 'boy', 'bring', 'build', 'busy', 'but', 'buy', 'call', 'came', 'can', 'car', 'card', 'care', 'carry', 'case', 'cat', 'change', 'child', 'city', 'close', 'club', 'cold', 'come', 'could', 'count', 'cut', 'day', 'did', 'die', 'do', 'dog', 'door', 'down', 'draw', 'drop', 'dry', 'each', 'ear', 'early', 'earth', 'easy', 'eat', 'end', 'even', 'ever', 'every', 'eye', 'face', 'fact', 'fall', 'family', 'far', 'farm', 'fast', 'father', 'feel', 'feet', 'few', 'field', 'find', 'fine', 'fire', 'first', 'fish', 'five', 'fly', 'food', 'foot', 'for', 'form', 'found', 'four', 'free', 'friend', 'from', 'front', 'full', 'fun', 'game', 'gave', 'get', 'girl', 'give', 'glass', 'go', 'gold', 'good', 'got', 'great', 'green', 'grow', 'had', 'hair', 'half', 'hand', 'hard', 'has', 'have', 'he', 'head', 'hear', 'help', 'her', 'here', 'high', 'him', 'his', 'hit', 'hold', 'home', 'hope', 'hot', 'hour', 'house', 'how', 'idea', 'if', 'in', 'into', 'is', 'it', 'its', 'job', 'just', 'keep', 'key', 'kind', 'king', 'know', 'land', 'last', 'late', 'learn', 'left', 'leg', 'less', 'let', 'letter', 'life', 'light', 'like', 'line', 'list', 'little', 'live', 'long', 'look', 'lot', 'love', 'made', 'make', 'man', 'many', 'map', 'may', 'me', 'mean', 'men', 'might', 'mile', 'miss', 'more', 'most', 'mother', 'move', 'much', 'must', 'my', 'name', 'near', 'need', 'never', 'new', 'next', 'nice', 'night', 'no', 'not', 'now', 'number', 'of', 'off', 'oh', 'old', 'on', 'once', 'one', 'only', 'open', 'or', 'other', 'our', 'out', 'over', 'own', 'page', 'paper', 'part', 'party', 'pass', 'past', 'people', 'pick', 'place', 'plan', 'play', 'point', 'put', 'read', 'real', 'red', 'rest', 'right', 'river', 'road', 'room', 'round', 'rule', 'run', 'said', 'same', 'saw', 'say', 'school', 'sea', 'seat', 'see', 'seem', 'send', 'set', 'she', 'ship', 'short', 'show', 'side', 'sing', 'sit', 'six', 'sleep', 'small', 'snow', 'so', 'some', 'song', 'soon', 'sound', 'speak', 'start', 'state', 'stay', 'step', 'still', 'stop', 'story', 'street', 'sun', 'sure', 'table', 'take', 'talk', 'tell', 'ten', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'thing', 'think', 'this', 'three', 'time', 'to', 'today', 'told', 'too', 'took', 'tree', 'true', 'try', 'turn', 'two', 'under', 'until', 'up', 'us', 'use', 'very', 'walk', 'want', 'war', 'warm', 'was', 'watch', 'water', 'way', 'we', 'week', 'well', 'went', 'were', 'what', 'when', 'where', 'which', 'while', 'white', 'who', 'why', 'will', 'wind', 'window', 'wish', 'with', 'word', 'work', 'world', 'write', 'year', 'yes', 'yet', 'you', 'young'
]
