export interface ExampleBet {
  question: string;
  bet_type: 'yesno' | 'multichoice';
  options?: string[];
}

export const ALL_EXAMPLES: ExampleBet[] = [
  { question: 'Will it rain before we finish dinner?', bet_type: 'yesno' },
  { question: 'Who will pick up the check?', bet_type: 'multichoice', options: ['The host', 'We split it', 'Someone sneaks out'] },
  { question: 'Will the meeting end on time?', bet_type: 'yesno' },
  { question: 'Best pizza topping?', bet_type: 'multichoice', options: ['Pepperoni', 'Mushrooms', 'Just cheese', 'Something weird'] },
  { question: 'Will we actually leave on time?', bet_type: 'yesno' },
  { question: 'Who finishes their food first?', bet_type: 'multichoice', options: ['The hungry one', 'The fast eater', 'No one — we\'re all too full'] },
  { question: 'Will the game go into overtime?', bet_type: 'yesno' },
  { question: 'First person to check their phone?', bet_type: 'multichoice', options: ['The one who said they wouldn\'t', 'The anxious one', 'It\'ll be me'] },
  { question: 'Will we order dessert?', bet_type: 'yesno' },
  { question: 'How does this movie end?', bet_type: 'multichoice', options: ['Happy ending', 'Twist ending', 'Depressing ending', 'Sequel bait'] },
  { question: 'Will the traffic be bad on the way home?', bet_type: 'yesno' },
  { question: 'Who suggests the after-party?', bet_type: 'multichoice', options: ['The night owl', 'The host', 'Nobody — we\'re all tired'] },
  { question: 'Will anyone show up late?', bet_type: 'yesno' },
  { question: 'What\'s for lunch tomorrow?', bet_type: 'multichoice', options: ['Leftovers', 'Something healthy', 'Whatever\'s closest'] },
  { question: 'Will this project ship on time?', bet_type: 'yesno' },
];
