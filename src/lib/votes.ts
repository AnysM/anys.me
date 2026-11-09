/**
 * Les cœurs déjà donnés, par œuvre, lus au moment du build.
 *
 * La page les demande aussi à la fonction Netlify au chargement, mais celle-ci
 * met de six dixièmes à une seconde et demie à répondre. Pendant ce temps la
 * carte n'avait qu'un point à la place du compte, et on croyait le compteur
 * cassé. Écrit dans le HTML, le nombre est là dès la première image ; le
 * script le corrige ensuite avec la valeur du moment.
 *
 * Rend `null` quand Airtable n'est pas joignable (un build local, par exemple)
 * pour que la page sache remettre son point plutôt que d'annoncer un faux zéro.
 */
export async function comptesDesVotes(): Promise<Record<string, number> | null> {
  const jeton = process.env.AIRTABLE_TOKEN;
  const base = process.env.AIRTABLE_BASE;
  if (!jeton || !base) return null;

  const compte: Record<string, number> = {};
  let offset: string | undefined;
  try {
    // Airtable rend cent lignes à la fois. Dix pages suffisent très largement,
    // et cette borne empêche une boucle sans fin si l'API se met à tourner.
    for (let page = 0; page < 10; page += 1) {
      const url = new URL(`https://api.airtable.com/v0/${base}/Votes`);
      url.searchParams.set('pageSize', '100');
      url.searchParams.set('fields[]', 'Œuvre');
      url.searchParams.set('filterByFormula', '{Spam} = ""');
      if (offset) url.searchParams.set('offset', offset);

      const r = await fetch(url, { headers: { Authorization: `Bearer ${jeton}` } });
      if (!r.ok) return null;

      const page_ = (await r.json()) as { records?: Array<{ fields?: Record<string, unknown> }>; offset?: string };
      for (const ligne of page_.records ?? []) {
        const oeuvre = ligne.fields?.['Œuvre'];
        if (typeof oeuvre === 'string' && oeuvre) compte[oeuvre] = (compte[oeuvre] ?? 0) + 1;
      }
      offset = page_.offset;
      if (!offset) break;
    }
  } catch (e) {
    // Un build ne tombe pas parce qu'Airtable tousse : la page reprend son point.
    console.warn('[votes] comptes indisponibles au build :', String((e as Error).message ?? e));
    return null;
  }
  return compte;
}
