import { getCollection } from 'astro:content';
import { SITE } from '../../lib/seo';

// Un fichier .ics par événement daté, ou par rendez-vous régulier avec des séances :
// la personne l'ouvre, et les dates entrent dans son agenda.
export async function getStaticPaths() {
  const tous = (await getCollection('agenda')).filter((e) => e.data.publie && (e.data.date || e.data.seances?.length));
  return tous.map((e) => ({ params: { id: e.id }, props: { e } }));
}

const pad = (n: number) => String(n).padStart(2, '0');
const jour = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
/** Échappe les virgules, points-virgules et retours à la ligne, comme le veut la norme iCalendar. */
const txt = (s = '') => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
/** « 18h30 - 20h » → [[18, 30], [20, 0]] ; « 19h30 » → [[19, 30], null] */
function horaires(h?: string): [[number, number] | null, [number, number] | null] {
  const m = [...(h ?? '').matchAll(/(\d{1,2})\s*h\s*(\d{2})?/g)].map((x) => [Number(x[1]), Number(x[2] ?? 0)] as [number, number]);
  return [m[0] ?? null, m[1] ?? null];
}

function evenement(uid: string, date: Date, heure: string | undefined, dateFin: Date | undefined, d: any, url: string) {
  const l = ['BEGIN:VEVENT', `UID:${uid}@anys.me`, `DTSTAMP:${jour(new Date())}T000000Z`];
  const [debut, fin] = horaires(heure);
  if (debut) {
    const f = fin ?? [(debut[0] + 2) % 24, debut[1]];
    l.push(`DTSTART;TZID=Europe/Paris:${jour(date)}T${pad(debut[0])}${pad(debut[1])}00`);
    l.push(`DTEND;TZID=Europe/Paris:${jour(date)}T${pad(f[0])}${pad(f[1])}00`);
  } else {
    // Sans horaire : un ou plusieurs jours entiers (DTEND est exclusif, d'où le +1 jour).
    const finExclusive = new Date(dateFin ?? date);
    finExclusive.setDate(finExclusive.getDate() + 1);
    l.push(`DTSTART;VALUE=DATE:${jour(date)}`, `DTEND;VALUE=DATE:${jour(finExclusive)}`);
  }
  l.push(
    `SUMMARY:${txt(d.titre)}`,
    ...(d.lieu ? [`LOCATION:${txt(d.lieu)}`] : []),
    `DESCRIPTION:${txt([d.resume, d.prix && `Tarif : ${d.prix}`, url].filter(Boolean).join('\n\n'))}`,
    `URL:${url}`,
    'END:VEVENT',
  );
  return l;
}

export function GET({ props }: { props: { e: any } }) {
  const { e } = props;
  const d = e.data;
  const url = d.site?.startsWith('http') ? d.site : `${SITE}/agenda/${e.id}/`;
  const aujourdhui = new Date(new Date().toDateString());
  const lignes = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//anys.me//Agenda//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${txt(d.titre)}`];
  if (d.date) lignes.push(...evenement(e.id, d.date, d.heure, d.date_fin, d, url));
  else for (const s of (d.seances ?? []).filter((s: any) => s.date >= aujourdhui)) lignes.push(...evenement(`${e.id}-${jour(s.date)}`, s.date, s.heure, undefined, d, url));
  lignes.push('END:VCALENDAR');
  return new Response(lignes.join('\r\n'), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="${e.id}.ics"` },
  });
}
