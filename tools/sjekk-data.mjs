// Kontroll av data-mappa. Kjøres av GitHub ved hver opplasting (.github/workflows/sjekk-data.yml),
// og kan kjøres lokalt: node tools/sjekk-data.mjs
// Samme regler som mottak.html bruker. Endrer du reglene der, endre dem her også.
// Ingen avhengigheter: bare Node sin standardbibliotek.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const D = join(ROOT, 'data');
const err = [], warn = [];
const E = (m, f) => err.push({ m, f }), W = (m, f) => warn.push({ m, f });

// ── Les filene ──
const read = p => {
  const f = join(D, p);
  if (!existsSync(f)) { E(`Fila mangler: data/${p}`); return null; }
  const t = readFileSync(f, 'utf8');
  let o; try { o = JSON.parse(t); } catch (e) { E(`Ugyldig JSON: ${e.message}`, `data/${p}`); return null; }
  if (t !== JSON.stringify(o, null, 2) + '\n') W('Formatet avviker fra standarden (2 mellomrom innrykk og linjeskift til slutt). Mottaket skriver det riktig neste gang.', `data/${p}`);
  return o;
};
const C = read('config.json') || {}, S = read('struktur.json') || {}, NO = read('sprak/no.json') || {}, UINO = read('ui/no.json') || {};

// ── Ting som aldri skal endres ──
if (C.lagringsnokkel !== 'fgv_app_v1') E('config.json: lagringsnokkel må være fgv_app_v1. Ellers mister familiene fremdriften sin.', 'data/config.json');
if (C.app !== 'veileder.html') E('config.json: app må være veileder.html. QR-koder og lenker peker dit.', 'data/config.json');
if (!existsSync(join(ROOT, 'veileder.html'))) E('veileder.html mangler. QR-koder og lenker peker dit.');

// ── Struktur ──
const LIST = { sporsmal: 'sporsmal', fase: 'faser', punkt: 'punkter', kontakt: 'kontakter' };
for (const arr of Object.values(LIST)) {
  if (!Array.isArray(S[arr])) { E(`struktur.json mangler lista «${arr}».`, 'data/struktur.json'); S[arr] = []; continue; }
  const seen = new Set();
  for (const x of S[arr]) {
    if (!x.id || !/^[a-z0-9-]+$/.test(x.id)) E(`Ugyldig ID i ${arr}: «${x.id}».`, 'data/struktur.json');
    if (seen.has(x.id)) E(`ID-en «${x.id}» er brukt to ganger i ${arr}.`, 'data/struktur.json');
    seen.add(x.id);
  }
}
const F = new Set(S.faser.map(f => f.id)), K = new Set(S.kontakter.map(k => k.id));
const Q = Object.fromEntries(S.sporsmal.map(q => [q.id, q.svar || ['nei', 'ja']]));
const need = [];
S.sporsmal.forEach(q => need.push(`sporsmal.${q.id}.tekst`, `sporsmal.${q.id}.ja`, `sporsmal.${q.id}.nei`));
S.faser.forEach(f => need.push(`fase.${f.id}.kort`, `fase.${f.id}.tittel`));
S.kontakter.forEach(k => need.push(`kontakt.${k.id}.navn`));
for (const p of S.punkter) {
  need.push(`punkt.${p.id}.tittel`, `punkt.${p.id}.tekst`);
  if (!F.has(p.fase)) E(`Punktet «${p.id}» hører til en fase som ikke finnes («${p.fase}»).`, 'data/struktur.json');
  for (const k of p.kontakter || []) if (!K.has(k)) E(`Punktet «${p.id}» viser til en kontakt som ikke finnes («${k}»).`, 'data/struktur.json');
  for (const v of p.vises_hvis || []) { const [a, b] = String(v).split('='); if (!Q[a] || !Q[a].includes(b)) E(`Punktet «${p.id}» har et ugyldig vilkår: «${v}».`, 'data/struktur.json'); }
  if (!['publisert', 'utkast'].includes(p.status)) E(`Punktet «${p.id}» har ukjent status «${p.status}».`, 'data/struktur.json');
  if (p.lenke && !/^https:\/\/\S+$/.test(p.lenke)) W(`Lenken i punktet «${p.id}» ser ikke riktig ut: ${p.lenke}`, 'data/struktur.json');
}
for (const k of need) if (!NO[k] || !String(NO[k]).trim()) E(`Norsk tekst mangler: ${k}`, 'data/sprak/no.json');
const belongs = k => { const m = k.match(/^(sporsmal|fase|punkt|kontakt)\.([^.]+)\./); return !!m && S[LIST[m[1]]].some(x => x.id === m[2]); };
const orphans = Object.keys(NO).filter(k => !belongs(k));
if (orphans.length) W(`${orphans.length} norske tekster hører ikke til noe i struktur.json: ${orphans.slice(0, 5).join(', ')}`, 'data/sprak/no.json');

// ── Språk ──
for (const l of C.sprak || []) {
  if (l.kode === 'no') continue;
  const t = read(`sprak/${l.kode}.json`), u = read(`ui/${l.kode}.json`);
  const st = existsSync(join(D, `sprak/${l.kode}.status.json`)) ? read(`sprak/${l.kode}.status.json`) : {};
  if (!t || !u) continue;
  const miss = Object.keys(NO).filter(k => !t[k]);
  if (miss.length) W(`${l.navn}: ${miss.length} tekster er ikke oversatt og vises på norsk.`, `data/sprak/${l.kode}.json`);
  const extra = Object.keys(t).filter(k => !(k in NO));
  if (extra.length) W(`${l.navn}: ${extra.length} tekster finnes ikke på norsk lenger.`, `data/sprak/${l.kode}.json`);
  const bad = Object.entries(st || {}).filter(([, v]) => !['ki', 'kontrollert'].includes(v && v.s));
  if (bad.length) E(`${l.navn}: ukjent status på ${bad.length} tekster.`, `data/sprak/${l.kode}.status.json`);
  const uim = Object.keys(UINO).filter(k => !u[k]);
  if (uim.length) W(`${l.navn}: ${uim.length} faste tekster i appen er ikke oversatt.`, `data/ui/${l.kode}.json`);
}

// ── Mapper på feil sted (f.eks. når mappa rundt «data» er dratt inn på GitHub) ──
const walk = d => readdirSync(d).flatMap(n => {
  if (n === '.git' || n === 'node_modules') return [];
  const p = join(d, n);
  return statSync(p).isDirectory() ? [p, ...walk(p)] : [];
});
for (const dir of walk(ROOT)) {
  const r = relative(ROOT, dir);
  if (r !== 'data' && /(^|\/)data$/.test(r)) E(`Mappa «${r}» ligger på feil sted. Den skulle vært lastet opp som «data». Slett mappa «${r.split('/')[0]}» på GitHub, og last opp mappa «data» på nytt.`, r);
}

// ── Resultat ──
const gh = !!process.env.GITHUB_ACTIONS;
for (const { m, f } of err) console.log(gh ? `::error${f ? ` file=${f}` : ''}::${m}` : `FEIL: ${m}${f ? ` (${f})` : ''}`);
for (const { m, f } of warn) console.log(gh ? `::warning${f ? ` file=${f}` : ''}::${m}` : `Merk: ${m}${f ? ` (${f})` : ''}`);
console.log(err.length ? `\n${err.length} feil må rettes.` : `\nData-mappa er i orden.${warn.length ? ` ${warn.length} merknader.` : ''}`);
process.exit(err.length ? 1 : 0);
