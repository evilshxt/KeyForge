export const getTextForMode = (mode: 'normal' | 'freeform' | 'monkey'): string => {
  switch (mode) {
    case 'normal':
      return "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once. Typing tests help improve speed and accuracy."
    case 'freeform':
      return "Type anything you want here. The system will check against a dictionary for accuracy."
    case 'monkey':
      return "cat dog run jump play swim eat sleep bird fish tree car bike bus train plane ship boat house door window chair table bed lamp book pen paper phone computer mouse keyboard screen light dark day night sun moon star"
    default:
      return ""
  }
}
