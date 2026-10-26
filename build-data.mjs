import fs from 'node:fs';

const source = fs.readFileSync(process.argv[2], 'utf8');
const paper = source.slice(
  source.indexOf('## Partie II : Compréhension orale'),
  source.indexOf('## Partie VII : Expression écrite')
).replace(/\r/g, '').replace(/\n---\n[\s\S]*?\n<!-- 原 PDF.*?-->/g, '\n');

const labels = [
  [1, 10, 'Écoute · Dialogues'], [11, 20, 'Écoute · Entretien'],
  [21, 30, 'Lexique'], [31, 40, 'Lexique · Texte à compléter'],
  [41, 60, 'Grammaire I'], [61, 80, 'Grammaire II'],
  [81, 85, 'Lecture · Somnambulisme'], [86, 90, 'Lecture · Permis'],
  [91, 95, 'Lecture · Matisse'], [96, 100, 'Lecture · Projet Voltaire']
];
const extractContext = (start, end) => {
  const from = source.indexOf(start), to = source.indexOf(end, from);
  return (from >= 0 && to > from ? source.slice(from, to) : '')
    .replace(/\r/g, '').replace(/^#+\s*/gm, '').replace(/\*\*/g, '')
    .replace(/<!--[^]*?-->/g, '').replace(/^---$/gm, '')
    .replace(/\n{3,}/g, '\n\n').trim();
};
const contexts = {
  31: extractContext('#### Retrouver sa famille', '\n31.'),
  81: extractContext('### Texte 1. Réveiller un somnambule', '\n81.'),
  86: extractContext('### Texte 2. Le permis à 1 euro par jour', '\n86.'),
  91: extractContext('### Texte 3. L\'exposition', '\n91.'),
  96: extractContext('### Texte 4. Le Projet Voltaire', '\n96.')
};
const answers = Object.fromEntries([...source.matchAll(/^\|\s*(\d+)\s*\|\s*([A-D])\*?\s*\|/gm)].map(m => [m[1], m[2]]));
const blocks = paper.split(/(?=^\d+\.\s)/m).map(block => {
  const match = block.match(/^(\d+)\.\s*([\s\S]*)$/);
  return match && { no: Number(match[1]), raw: match[2].trim() };
}).filter(Boolean);
const questions = blocks.filter(m => m.no <= 100).map(m => {
  const no = m.no;
  // A section or passage heading ends the question; keep following material in contexts only.
  let raw = m.raw.split(/^#{2,}\s/m)[0].trim();
  raw = raw.replace(/^###.*$/gm, '').replace(/\*\*([A-D])\s*\.\*\*/g, '$1.');
  raw = raw.replace(/\n{2,}Dans cette section[\s\S]*$/, '');
  raw = raw.replace(/(?:^|\s)([A-D])\s*\.\s/g, '\n$1. ');
  const optionMatches = [...raw.matchAll(/(?:^|\n)([A-D])\s*\.\s*([\s\S]*?)(?=(?:\n\s*[A-D]\s*\.\s)|(?:\n\s*\d+\.\s)|$)/g)];
  const firstOption = raw.search(/(?:^|\n)[A-D]\s*\.\s/);
  const text = (firstOption >= 0 ? raw.slice(0, firstOption) : raw)
    .replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  const options = Object.fromEntries(optionMatches.map(x => [x[1], x[2]
    .replace(/<!--[\s\S]*|## Partie[\s\S]*/g, '')
    .replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim()]));
  return { no, text: text || `Question ${no}`, options, answer: answers[String(no)] || null,
    group: labels.find(([a, b]) => no >= a && no <= b)?.[2] || 'Examen' };
});

if (questions.length !== 100 || Object.keys(answers).length !== 100) {
  throw new Error(`Import incomplet : ${questions.length} questions, ${Object.keys(answers).length} réponses.`);
}
fs.writeFileSync('dist/exam-data.js', `window.EXAM_DATA=${JSON.stringify({ labels, questions, contexts })};\n`);
console.log(`Imported ${questions.length} questions.`);
