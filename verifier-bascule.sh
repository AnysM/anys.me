#!/usr/bin/env bash
# Vérifie que la bascule d'anys.me vers Netlify s'est bien passée, et surtout
# que les mails n'ont pas été emportés au passage.
#
#   ./verifier-bascule.sh

set -uo pipefail

APEX_NETLIFY="75.2.60.5"
NETLIFY="anysme.netlify.app"

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
non()  { printf '  \033[31m✗\033[0m %s\n' "$1"; ENNUIS=$((ENNUIS + 1)); }
tiede(){ printf '  \033[33m·\033[0m %s\n' "$1"; }
titre(){ printf '\n\033[1m%s\033[0m\n' "$1"; }

ENNUIS=0

titre "📬 Les mails — le plus important"
mx=$(dig +short anys.me MX | sort)
if [ -z "$mx" ]; then
  non "AUCUN enregistrement MX. contact@anys.me ne reçoit plus rien."
elif printf '%s' "$mx" | grep -q 'mail.ovh.net'; then
  ok "MX intacts, toujours chez OVH :"
  printf '%s\n' "$mx" | sed 's/^/      /'
else
  non "Les MX ont changé et ne pointent plus vers OVH :"
  printf '%s\n' "$mx" | sed 's/^/      /'
fi

spf=$(dig +short anys.me TXT | grep -i 'v=spf1')
if [ -n "$spf" ]; then ok "SPF en place : $spf"
else non "SPF disparu — tes mails risquent de partir en spam"; fi

titre "🅰️ Le DNS"
a=$(dig +short anys.me A)
if [ "$a" = "$APEX_NETLIFY" ]; then
  ok "anys.me → $a (Netlify)"
elif [ -z "$a" ]; then
  non "anys.me n'a plus d'enregistrement A"
else
  tiede "anys.me → $a — pas encore Netlify ($APEX_NETLIFY). Propagation en cours ?"
fi

aaaa=$(dig +short anys.me AAAA)
if [ -z "$aaaa" ]; then
  ok "pas d'AAAA : les visiteurs en IPv6 passent par le A"
else
  non "AAAA encore là ($aaaa) — tes visiteurs en IPv6 voient l'ancien WordPress"
fi

w=$(dig +short www.anys.me CNAME)
if printf '%s' "$w" | grep -q 'netlify'; then ok "www.anys.me → $w"
else tiede "www.anys.me : CNAME attendu vers $NETLIFY. Trouvé : ${w:-rien}"; fi

titre "🔒 Le certificat et les pages"
if curl -sI --max-time 15 https://anys.me/ >/dev/null 2>&1; then
  ok "HTTPS répond sans erreur de certificat"
else
  non "HTTPS échoue — certificat pas encore émis, ou DNS pas propagé"
fi

serveur=$(curl -sI --max-time 15 https://anys.me/ | grep -i '^server:' | tr -d '\r')
printf '      %s\n' "${serveur:-(pas d\'en-tête Server)}"

# On cherche la balise, pas le nom de domaine : l'ancien WordPress embarque un
# script anti-cookies qui contient « cloud.umami.is » dans sa liste de blocage,
# et faisait passer le test au vert alors qu'il servait encore WordPress.
if curl -s --max-time 15 https://anys.me/ | grep -q 'data-website-id'; then
  ok "Umami est chargé sur l'accueil"
else
  non "Umami absent de l'accueil — le site servi est peut-être encore l'ancien"
fi

# -L parce que les pages en dossier (/codex) renvoient un 301 vers /codex/ :
# c'est le bon comportement, et c'est le code final qui nous intéresse.
for p in /a-propos /agenda /contact /soins /codex; do
  c=$(curl -sL -o /dev/null -w '%{http_code}' --max-time 15 "https://anys.me$p")
  [ "$c" = "200" ] && ok "$p → 200" || non "$p → $c"
done

titre "🔁 Les redirections WordPress"
for duo in "/immersions:/in-carne" "/agenda-2/:/agenda" "/hello-world:/" "/wp-login.php:/"; do
  de=${duo%%:*}; vers=${duo##*:}
  rep=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 15 "https://anys.me$de")
  code=${rep%% *}; cible=${rep#* }
  if [ "$code" = "301" ] && printf '%s' "$cible" | grep -q "anys.me$vers\$"; then
    ok "$de → $vers"
  else
    non "$de : attendu 301 vers $vers, obtenu $code ${cible:-}"
  fi
done

titre "📝 Le formulaire"
c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 \
      -X POST https://anys.me/.netlify/functions/formulaire)
case "$c" in
  400|422) ok "la fonction répond ($c sur un envoi vide : elle refuse, c'est bon)" ;;
  404|000) non "la fonction est introuvable ($c)" ;;
  *)       tiede "la fonction répond $c sur un envoi vide" ;;
esac

titre "🗺️ Le sitemap"
c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 https://anys.me/sitemap-index.xml)
[ "$c" = "200" ] && ok "sitemap-index.xml → 200" || non "sitemap-index.xml → $c"

printf '\n'
if [ "$ENNUIS" -eq 0 ]; then
  printf '\033[32m\033[1m  La bascule est faite. Rien à signaler.\033[0m\n\n'
else
  printf '\033[31m\033[1m  %s point(s) à regarder ci-dessus.\033[0m\n' "$ENNUIS"
  printf '  Si c'"'"'est le DNS, attends une heure et relance : le TTL est à 3600 s.\n\n'
fi
exit 0
