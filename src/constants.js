// One-tap skill suggestions shown on the My Skills screen.
export const SUGGESTED_SKILLS = [
  'java',
  'python',
  'guitar',
  'photoshop',
  'public speaking',
  'excel',
  'react',
  'figma',
  'video editing',
  'chess',
  'drawing',
  'singing',
];

// Skill levels. A match only counts when the TEACHER's level is above the LEARNER's level.
export const LEVEL_VALUE = { new: 0, beginner: 1, intermediate: 2, expert: 3 };

// Short names used on chips and cards
export const LEVEL_SHORT = { new: 'New', beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' };

// Level choices when you TEACH a skill (how good you are)
export const TEACH_LEVEL_OPTIONS = [
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'expert', label: 'Expert' },
];

// Level choices when you want to LEARN a skill (where you are now)
export const LEARN_LEVEL_OPTIONS = [
  { key: 'new', label: 'Never tried' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
];

export const DEFAULT_TEACH_LEVEL = 'intermediate';
export const DEFAULT_LEARN_LEVEL = 'new';
