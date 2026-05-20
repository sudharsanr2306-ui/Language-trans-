
export const OFF_LINE_DICTIONARY: Record<string, Record<string, string>> = {
  'en-es': {
    'hello': 'hola',
    'goodbye': 'adiós',
    'thank you': 'gracias',
    'please': 'por favor',
    'yes': 'sí',
    'no': 'no',
    'help': 'ayuda',
    'where is the bathroom?': '¿dónde está el baño?',
    'how much does this cost?': '¿cuánto cuesta esto?',
    'my name is': 'mi nombre es',
    'i am lost': 'estoy perdido',
    'water': 'agua',
    'food': 'comida',
    'hospital': 'hospital',
    'friend': 'amigo',
  },
  'en-fr': {
    'hello': 'bonjour',
    'goodbye': 'au revoir',
    'thank you': 'merci',
    'please': 's’il vous plaît',
    'yes': 'oui',
    'no': 'non',
    'help': 'aide',
    'where is the bathroom?': 'où sont les toilettes ?',
    'how much does this cost?': 'combien ça coûte ?',
    'my name is': 'je m’appelle',
    'i am lost': 'je suis perdu',
    'water': 'eau',
    'food': 'nourriture',
    'hospital': 'hôpital',
    'friend': 'ami',
  }
};

export function getOfflineTranslation(text: string, from: string, to: string): string | null {
  const key = `${from}-${to}`.toLowerCase();
  const dict = OFF_LINE_DICTIONARY[key];
  if (!dict) return null;
  
  const normalizedText = text.trim().toLowerCase();
  return dict[normalizedText] || null;
}
