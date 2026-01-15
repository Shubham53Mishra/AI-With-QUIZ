// lib/timer.js
export function getTimeLeftForNextQuestion(lastQuestionDate) {
  if (!lastQuestionDate) return 0;
  const last = new Date(lastQuestionDate);
  const now = new Date();
  const next = new Date(last.getTime() + 18 * 60 * 60 * 1000); // 18 hours later
  const diff = next - now;
  return diff > 0 ? diff : 0;
}
