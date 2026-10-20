// "public speaking" -> "Public Speaking"
export const titleCase = (s = '') => s.replace(/\b\w/g, (c) => c.toUpperCase());

// Works with plain names or { name, level } objects
export const joinSkills = (list = []) =>
  list.map((x) => titleCase(typeof x === 'string' ? x : x.name)).join(', ');
