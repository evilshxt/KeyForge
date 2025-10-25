// @ts-ignore
import { getRandomMonkeyWords } from './wordValidator'

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
  "When the village elder passed away, she left behind a chest of letters that revealed family secrets spanning three generations, bringing healing and understanding to a family that had been divided for decades.",
  "The nomadic tribe traversed vast deserts, their camels carrying precious spices and silks across ancient trade routes. Each journey tested their endurance, but also deepened their connection to the land and its timeless rhythms.",
  "Deep in the laboratory, geneticist Dr. Lena Chen made a breakthrough that could cure hereditary diseases. But as she delved deeper into her research, she discovered ethical boundaries that challenged the very definition of what it means to be human.",
  "The symphony conductor raised her baton, and the orchestra responded with perfect harmony. Each musician contributed their unique voice, creating a masterpiece that transcended individual talent and became something greater than the sum of its parts.",
  "In the quiet hours before dawn, the baker kneaded dough with practiced hands, infusing each loaf with care and tradition. Her bread fed not just bodies, but also the souls of those who appreciated the simple beauty of well-crafted food.",
  "The archaeologist carefully brushed away centuries of dust from the ancient artifact. What emerged was not just an object, but a window into a civilization that had shaped the course of human history in ways we are only beginning to understand.",
  "As the storm raged outside, the family gathered around the fireplace sharing stories of their ancestors. These tales, passed down through generations, served as both entertainment and life lessons, binding them together through shared heritage.",
  "The young entrepreneur poured her savings into a dream that many called foolish. But her innovative approach to sustainable fashion caught the attention of investors, proving that sometimes the greatest risks lead to the most rewarding successes.",
  "High atop the mountain peak, the climber paused to catch her breath and admire the view. The journey had been grueling, but reaching the summit taught her that true accomplishment comes not from the destination, but from the strength discovered along the way.",
  "The librarian's fingers danced across the keyboard, digitizing rare manuscripts that had been hidden for centuries. Her work preserved knowledge that might otherwise have been lost forever, ensuring that future generations could learn from the wisdom of the past.",
  "In the bustling marketplace, merchants haggled over prices while customers searched for the perfect ingredients. This daily ritual of commerce created not just economic transactions, but also social connections that wove the fabric of community life."
]

export const getTextForMode = async (mode: 'normal' | 'freeform' | 'monkey'): Promise<string> => {
  switch (mode) {
    case 'normal':
      // Select 3-5 random paragraphs for a longer typing experience
      const numParagraphs = Math.floor(Math.random() * 3) + 3 // 3-5 paragraphs
      const selectedParagraphs: string[] = []
      const usedIndices = new Set<number>()

      for (let i = 0; i < numParagraphs; i++) {
        let randomIndex: number
        do {
          randomIndex = Math.floor(Math.random() * normalTexts.length)
        } while (usedIndices.has(randomIndex))

        usedIndices.add(randomIndex)
        selectedParagraphs.push(normalTexts[randomIndex])
      }

      return selectedParagraphs.join('\n\n') // Double newline for paragraph separation
    case 'freeform':
      return "Type anything you want here. The system will check against a dictionary for accuracy."
    case 'monkey':
      // Get random words from the GitHub dictionary (same as freeform mode)
      try {
        return await getRandomMonkeyWords(80)
      } catch (error) {
        console.error('❌ Failed to load monkey mode words:', error)
        // Fallback to a simple hardcoded list if dictionary fails
        const fallbackWords = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog', 'and', 'runs', 'through', 'the', 'forest', 'with', 'great', 'speed', 'and', 'agility', 'while', 'avoiding', 'all', 'obstacles', 'in', 'its', 'path', 'towards', 'victory', 'and', 'success', 'in', 'this', 'amazing', 'typing', 'test', 'that', 'measures', 'your', 'skills', 'and', 'abilities', 'with', 'precision', 'and', 'accuracy', 'showing', 'your', 'true', 'potential', 'as', 'a', 'master', 'typist', 'who', 'can', 'type', 'faster', 'than', 'lightning', 'and', 'more', 'accurately', 'than', 'a', 'laser', 'beam', 'hitting', 'its', 'target', 'with', 'perfect', 'precision', 'every', 'single', 'time', 'without', 'fail']
        return fallbackWords.slice(0, 80).join(' ')
      }
    default:
      return ""
  }
}

export const getParagraphsByIndices = (indices: number[]): string => {
  const selectedParagraphs = indices.map(index => normalTexts[index]).filter(Boolean)
  return selectedParagraphs.join('\n\n')
}
