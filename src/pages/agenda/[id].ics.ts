import { getCollection } from 'astro:content';
import { SITE } from '../../lib/seo';

// Un fichier .ics par événement daté : la personne l'ouvre, la date entre dans son agenda.
export async function getStaticPaths() {
  const dates = (await getCollection('agenda')).filter((e) => e.data.publie && e.data.date);
  return dates.map((e) => ({ params: { id: e.id }, props: { e } }));
}

const pad = (n: number) => String(n).padStart(2, '0');
const jour = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
/** Échappe les virgules, points-virgules et retours à la ligne, comme le veut la norme iCalendar. */
const txt = (s = '') => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n');

export function GET({ props }: { props: { e: any } }) {
  const { e } = props;
  const d = e.data;
  const debut: Date = d.date;
  const heure = d.heure?.match(/^(\d{1,2})\s*h\s*(\d{2})?/);

  const lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//anys.me//Agenda//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.id}@anys.me`,
    `DTSTAMP:${jour(new Date())}T000000Z`,
  ];

  if (heure) {
    // Un horaire précis : on reste en heure de Paris.
    const h = pad(Number(heure[1]));
    const m = heure[2] ?? '00';
    const fin = pad((Number(heure[1]) + 2) % 24);
    lignes.push(`DTSTART;TZID=Europe/Paris:${jour(debut)}T${h}${m}00`);
    lignes.push(`DTEND;TZID=Europe/Paris:${jour(debut)}T${fin}${m}00`);
  } else {
    // Sans horaire : un ou plusieurs jours entiers (DTEND est exclusif, d'où le +1 jour).
    const finExclusive = new Date(d.date_fin ?? debut);
    finExclusive.setDate(finExclusive.getDate() + 1);
    lignes.push(`DTSTART;VALUE=DATE:${jour(debut)}`);
    lignes.push(`DTEND;VALUE=DATE:${jour(finExclusive)}`);
  }

  lignes.push(
    `SUMMARY:${txt(d.titre)}`,
    ...(d.lieu ? [`LOCATION:${txt(d.lieu)}`] : []),
    `DESCRIPTION:${txt([d.resume, d.prix && `Tarif : ${d.prix}`].filter(Boolean).join('\n\n'))}`,
    `URL:${d.site ?? `${SITE}/agenda/${e.id}/`}`,
    'END:VEVENT',
    'END:VCALENDAR',
  );

  return new Response(lignes.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${e.id}.ics"`,
    },
  });
}
