const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Session time slots offered in the planner
export const TIME_SLOTS = [
  { key: '9', label: '9:00 AM', hour: 9 },
  { key: '11', label: '11:00 AM', hour: 11 },
  { key: '14', label: '2:00 PM', hour: 14 },
  { key: '16', label: '4:00 PM', hour: 16 },
  { key: '18', label: '6:00 PM', hour: 18 },
  { key: '20', label: '8:00 PM', hour: 20 },
];

// The next n days starting today, for the day picker
export const nextDays = (n = 7) => {
  const base = new Date();
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${DAYS[d.getDay()]} ${d.getDate()}`;
    out.push({ key: String(i), label, date: d });
  }
  return out;
};

// Combine a day and a time slot into one Date
export const slotDate = (day, slot) =>
  new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate(), slot.hour, 0, 0, 0);

export const formatTime = (d) => {
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
};

// "Today at 6:00 PM", "Tomorrow at 9:00 AM", "Mon, 19 Oct at 4:00 PM"
export const formatSessionTime = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  const dayLabel = same(d, today)
    ? 'Today'
    : same(d, tomorrow)
    ? 'Tomorrow'
    : `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return `${dayLabel} at ${formatTime(d)}`;
};

export const isPast = (iso) => new Date(iso).getTime() < Date.now();
