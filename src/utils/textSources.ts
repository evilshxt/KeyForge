const normalTexts = [
  "In the quiet town of Eldoria, young Elara discovered an ancient map hidden in her grandmother's attic. The map led to a forgotten forest where legends spoke of a hidden treasure guarded by mystical creatures. With courage in her heart, she set out on an adventure that would change her life forever.",
  "Dr. Samuel Thorne had always been fascinated by the stars. One stormy night, he observed a peculiar comet through his telescope. This sighting sparked a series of events that would lead him to uncover secrets about the universe that no one had ever imagined possible.",
  "The bustling city of Neonburg never slept, its streets alive with the hum of hovercars and the glow of holographic advertisements. Amid this chaos, Detective Kira Voss pursued an elusive hacker who threatened to disrupt the entire digital infrastructure of the metropolis.",
  "Once upon a time, in a kingdom far away, a humble baker named Lila found a magical seed in her flour sack. Planting it overnight, she awoke to a garden that grew sweets of every kind, attracting visitors from distant lands and teaching her the true value of sharing.",
  "Captain Aria navigated her ship through treacherous asteroid fields, her crew relying on her sharp instincts and unyielding determination. Each journey brought new challenges, but also the thrill of discovery as they charted unknown regions of space.",
  "In the enchanted woods, a fox named Finn stumbled upon a glowing crystal that granted wishes. However, with great power came great responsibility, and Finn had to learn the importance of using it wisely to protect his forest home from impending danger.",
  "The annual festival in Riverton was a spectacle of lights, music, and laughter. As the sun set, families gathered to share stories and delicacies, celebrating the harvest and the bonds that held their community together through every season.",
  "Professor Elias Reed dedicated his life to studying ancient civilizations. One day, he decoded a long-lost inscription that revealed the location of a legendary city buried beneath the sands, promising to rewrite history as we knew it.",
  "Lila's small bookstore was a haven for dreamers and thinkers alike. Surrounded by towering shelves of forgotten tales, she helped customers find not just books, but the inspiration to embark on their own extraordinary journeys.",
  "The mountain village of Whisperwind faced a harsh winter, but the villagers' spirit remained unbroken. Through cooperation and kindness, they overcame the challenges, emerging stronger and more united than ever before.",
  "Beneath the ocean's surface, marine biologist Alex Harper explored vibrant coral reefs teeming with life. His discoveries about endangered species led to global efforts to protect the seas, inspiring a new generation of environmental stewards.",
  "In a futuristic academy, young inventor Mia designed robots that could think and feel. Her creations revolutionized daily life, but she soon realized the ethical dilemmas that came with playing god in the world of artificial intelligence.",
  "The old lighthouse on the cliffside had stood for centuries, guiding ships through stormy nights. When a young keeper named Tomas inherited it, he uncovered its secrets, including hidden messages from sailors long lost to the waves.",
  "During a summer road trip, friends discovered an abandoned amusement park frozen in time. As they explored the rusty rides and faded attractions, they pieced together the story of a joyful place that had been forgotten by the world.",
  "Artist Sofia painted murals that brought color to the gray walls of her city. Each stroke told a story of hope and resilience, transforming neglected spaces into vibrant tributes to the human spirit and community strength.",
  "The young wizard apprentice discovered an ancient spellbook in the library's forbidden section. As he practiced the incantations, he realized that magic required not just power, but wisdom and responsibility to use it for the greater good.",
  "In the year 2147, humanity had colonized Mars, but the red planet held secrets that challenged everything scientists thought they knew about the solar system and the origins of life itself.",
  "Sarah's coffee shop was more than just a place for caffeine; it was a community hub where neighbors shared dreams, solved problems, and formed lasting friendships over steaming mugs and fresh pastries.",
  "The detective followed a trail of clues through the city's underground tunnels, racing against time to prevent a catastrophe that could level half the metropolis and change the world forever.",
  "When the village elder passed away, she left behind a chest of letters that revealed family secrets spanning three generations, bringing healing and understanding to a family that had been divided for decades."
]

const monkeyWords = [
  "cat", "dog", "run", "jump", "play", "swim", "eat", "sleep", "bird", "fish", "tree", "car", "bike", "bus", "train", "plane", "ship", "boat", "house", "door", "window", "chair", "table", "bed", "lamp", "book", "pen", "paper", "phone", "computer", "mouse", "keyboard", "screen", "light", "dark", "day", "night", "sun", "moon", "star", "quick", "brown", "fox", "lazy", "river", "mountain", "valley", "ocean", "desert", "forest", "jungle", "city", "town", "village", "street", "road", "path", "bridge", "tunnel", "cave", "hill", "rock", "stone", "pebble", "sand", "dirt", "grass", "flower", "plant", "leaf", "branch", "root", "stem", "trunk", "bark", "wood", "metal", "plastic", "glass", "fabric", "leather", "cotton", "silk", "wool", "yarn", "thread", "needle", "button", "zipper", "pocket", "wallet", "purse", "bag", "backpack", "suitcase", "luggage", "box", "container", "bottle", "jar", "cup", "mug", "plate", "bowl", "spoon", "fork", "knife", "chopstick", "straw", "napkin", "towel", "soap", "shampoo", "toothbrush", "toothpaste", "comb", "brush", "mirror", "clock", "watch", "timer", "alarm", "calendar", "schedule", "appointment", "meeting", "conference", "call", "email", "message", "text", "chat", "forum", "blog", "post", "comment", "review", "rating", "heart", "like", "share", "follow", "subscribe", "notification", "alert", "warning", "error", "success", "complete", "finish", "start", "begin", "end", "top", "bottom", "left", "right", "front", "back", "inside", "outside", "above", "below", "up", "down", "in", "out", "on", "off", "over", "under", "around", "through", "between", "among", "within", "without", "before", "after", "during", "while", "until", "since", "because", "although", "however", "therefore", "moreover", "furthermore", "consequently", "meanwhile", "previously", "subsequently", "finally", "initially", "ultimately", "eventually", "gradually", "suddenly", "quickly", "slowly", "carefully", "quietly", "loudly", "softly", "gently", "roughly", "smoothly", "approximately", "exactly", "precisely", "nearly", "almost", "about", "around", "nearly", "roughly", "approximately", "exactly", "precisely", "nearly", "almost", "about", "around", "nearly", "roughly", "happy", "sad", "angry", "excited", "tired", "hungry", "thirsty", "cold", "hot", "big", "small", "tall", "short", "long", "wide", "narrow", "deep", "shallow", "fast", "slow", "easy", "hard", "simple", "complex", "good", "bad", "right", "wrong", "true", "false", "yes", "no", "maybe", "perhaps", "definitely", "certainly", "probably", "possibly", "never", "always", "sometimes", "often", "rarely", "usually", "normally", "especially", "particularly", "mainly", "mostly", "generally", "specifically", "exactly", "precisely", "approximately", "roughly", "about", "around", "nearly", "almost", "just", "only", "even", "also", "too", "very", "quite", "rather", "pretty", "fairly", "extremely", "incredibly", "amazingly", "surprisingly", "unexpectedly", "fortunately", "unfortunately", "luckily", "sadly", "happily", "angrily", "excitedly", "tiredly", "quickly", "slowly", "carefully", "quietly", "loudly", "softly", "gently", "roughly", "smoothly", "carefully", "quickly", "slowly", "gently", "roughly", "smoothly", "carefully", "quickly", "slowly", "gently", "roughly", "smoothly"
]

export const getTextForMode = (mode: 'normal' | 'freeform' | 'monkey'): string => {
  switch (mode) {
    case 'normal':
      return normalTexts[Math.floor(Math.random() * normalTexts.length)]
    case 'freeform':
      return "Type anything you want here. The system will check against a dictionary for accuracy."
    case 'monkey':
      // Randomly select 80 words from the pool for variety
      const selectedWords: string[] = []
      const wordsCopy = [...monkeyWords]

      for (let i = 0; i < 80 && wordsCopy.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * wordsCopy.length)
        selectedWords.push(wordsCopy.splice(randomIndex, 1)[0])
      }

      return selectedWords.join(' ')
    default:
      return ""
  }
}
