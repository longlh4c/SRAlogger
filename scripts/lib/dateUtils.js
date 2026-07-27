const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function addDays(date, quantity) {
  const result = new Date(date);
  result.setDate(result.getDate() + quantity);
  return result;
}

function formatDate(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getNextWeekday(date) {
  const day = date.getDay();
  if (day === 6) return addDays(date, 2); // Saturday -> Monday
  if (day === 0) return addDays(date, 1); // Sunday -> Monday
  return date;
}

function getLastWeekMondayOffset() {
  const today = new Date();
  const day = today.getDay();
  const daysToSubtract = day === 0 ? 13 : day + 6;
  return -daysToSubtract;
}

module.exports = {
  MONTHS,
  addDays,
  formatDate,
  isWeekend,
  getNextWeekday,
  getLastWeekMondayOffset,
};
