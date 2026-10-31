// Plie la page /relecture en un dossier qui se suffit à lui-même : la page,
// ses deux feuilles de style, ses polices, ses photos et le moteur. Tout y
// est appelé par un chemin relatif — le dossier peut se poser n'importe où.
import { readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';

// Pour refaire la page après un changement de texte :
//   npx astro build
//   node scripts/plier-relecture.mjs <dossier de sortie>
// puis poser le dossier dans public/relecture/ sur la branche tina.
const DIST = new URL('../dist/', import.meta.url).pathname;
const SORTIE = process.argv[2];
if (!SORTIE) { console.error('il faut un dossier de sortie'); process.exit(1); }

await rm(SORTIE, { recursive: true, force: true });
await mkdir(SORTIE, { recursive: true });

let page = await readFile(join(DIST, 'relecture/index.html'), 'utf8');

const emporter = async (rel) => {
  const dest = join(SORTIE, rel);
  await mkdir(dirname(dest), { recursive: true });
  await copyFile(join(DIST, rel), dest);
};

// Tout est appelé depuis /relecture/ : un chemin absolu, donc, et pas un
// chemin relatif. Une url() posée dans une variable CSS se résout là où elle
// sert — dans la feuille de style, pas dans la page — et un « ./ » partait
// alors chercher les images à côté du CSS.
const souche = '/relecture/';

// Les feuilles de style : elles appellent les polices à leur tour.
const styles = [...page.matchAll(/\/(_astro\/[^"]+\.css)/g)].map((m) => m[1]);
for (const s of new Set(styles)) {
  let css = await readFile(join(DIST, s), 'utf8');
  for (const f of new Set([...css.matchAll(/\/(fonts\/[^)"']+)/g)].map((m) => m[1]))) {
    await emporter(f);
    css = css.replaceAll('/' + f, souche + f);
  }
  const dest = join(SORTIE, s);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, css, 'utf8');
}

// Les images et les polices appelées depuis la page — entre guillemets ou
// au fond d'une url().
for (const m of new Set([...page.matchAll(/\/((?:img|fonts)\/[^"')\s]+)/g)].map((x) => x[1]))) {
  await emporter(m);
}

// Les liens de navigation (/a-propos, /soins…) gardent leur chemin : ils
// mènent au site. Seuls les fichiers que l'on emporte changent d'adresse.
page = page.replace(/\/((?:_astro|img|fonts)\/)/g, souche + '$1');

await writeFile(join(SORTIE, 'index.html'), page, 'utf8');
await copyFile(join(DIST, 'relecture/editeur.js'), join(SORTIE, 'editeur.js'));
console.log('plié dans ' + SORTIE);
