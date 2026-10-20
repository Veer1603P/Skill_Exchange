export const isEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

const countSkills = (s = '') =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean).length;

export const validateLogin = ({ email, password }) => {
  const e = {};
  if (!isEmail(email)) e.email = 'Enter a valid email address';
  if (!password) e.password = 'Enter your password';
  return e;
};

export const validateRegister = ({ name, email, password, teach, learn }) => {
  const e = {};
  if (!name.trim()) e.name = 'Enter your name';
  if (!isEmail(email)) e.email = 'Enter a valid email address';
  if (password.length < 4) e.password = 'Use at least 4 characters';
  if (countSkills(teach) === 0) e.teach = 'Add at least one skill you can teach';
  if (countSkills(learn) === 0) e.learn = 'Add at least one skill you want to learn';
  return e;
};
