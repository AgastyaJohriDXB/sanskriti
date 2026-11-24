// Pure scoring logic (no DOM) so it can be tested.
export function tally(questions, answers) {
  const traits = {};
  answers.forEach((optIndex, qi) => {
    const opt = questions[qi]?.options?.[optIndex];
    if (!opt) return;
    for (const [t, w] of Object.entries(opt.traits)) traits[t] = (traits[t] || 0) + w;
  });
  return traits;
}
export function rank(skills, traits) {
  return skills
    .map((s, i) => {
      let score = 0, best = null, bestVal = -1;
      for (const [t, w] of Object.entries(s.quizWeights || {})) {
        const v = (traits[t] || 0) * w;
        score += v;
        if (v > bestVal) { bestVal = v; best = t; }
      }
      return { skill: s, score, reason: best, order: i };
    })
    .sort((a, b) => b.score - a.score || a.order - b.order);
}
