export interface OccasionPrompt {
  emoji: string;
  label: string;
  question: string;
  bet_type: 'yesno' | 'multiple_choice';
  options?: string[];
  sampleImage?: string;
}

export const OCCASION_PROMPTS: OccasionPrompt[] = [
  {
    emoji: '🎉',
    label: 'Gender Reveal',
    question: 'Boy or girl?',
    bet_type: 'yesno',
    sampleImage: '/samples/gender-reveal.png',
  },
  {
    emoji: '🏈',
    label: 'Watch Party',
    question: 'Who wins tonight?',
    bet_type: 'multiple_choice',
    options: ['Home team', 'Away team'],
    sampleImage: '/samples/watch-party.png',
  },
  {
    emoji: '🍽️',
    label: 'Team Dinner',
    question: 'Who picks up the tab?',
    bet_type: 'multiple_choice',
    options: ['The host', 'We split it', 'Someone sneaks out'],
    sampleImage: '/samples/team-dinner.png',
  },
  {
    emoji: '🎂',
    label: 'Birthday',
    question: 'Will they cry when they see the cake?',
    bet_type: 'yesno',
    sampleImage: '/samples/birthday.png',
  },
  {
    emoji: '🏖️',
    label: 'Trip',
    question: 'Will we actually leave on time?',
    bet_type: 'yesno',
    sampleImage: '/samples/trip.png',
  },
  {
    emoji: '🎤',
    label: 'Karaoke Night',
    question: 'Who goes first?',
    bet_type: 'multiple_choice',
    options: ['The brave one', 'The one we force', 'Someone unexpected'],
    sampleImage: '/samples/karaoke.png',
  },
  {
    emoji: '👶',
    label: 'Baby Shower',
    question: "What's the baby's name?",
    bet_type: 'multiple_choice',
    options: ['Something classic', 'Something trendy', 'A total surprise'],
    sampleImage: '/samples/baby-shower.png',
  },
  {
    emoji: '🏆',
    label: 'Game Night',
    question: 'Who wins tonight?',
    bet_type: 'multiple_choice',
    options: ['The usual', 'The underdog', 'Whoever cheats best'],
    sampleImage: '/samples/game-night.png',
  },
];

// Legacy export for backward compat (unused after home redesign)
export interface ExampleBet {
  question: string;
  bet_type: 'yesno' | 'multichoice';
  options?: string[];
}

export const ALL_EXAMPLES: ExampleBet[] = OCCASION_PROMPTS.map(p => ({
  question: p.question,
  bet_type: p.bet_type === 'multiple_choice' ? 'multichoice' : p.bet_type,
  options: p.options,
}));
