#!/usr/bin/env bash
# Vérifie que la bascule d'anys.me vers Netlify s'est bien passée, et surtout
# que les mails n'ont pas été emportés au passage.
#
#   ./verifier-bascule.sh
#
# Le piège de ce genre de vérification, c'est le cache : ta machine garde
# l'ancienne adresse jusqu'à une heure et ferait échouer tous les tests alors
# que la bascule est faite. On interroge donc OVH directement, et on force
# curl vers l'adresse ainsi obtenue au lieu de laisser le système choisir.

set -uo pipefail

AUTORITE="ns200.anycast.me"      # le serveur de noms qui fait foi pour anys.me
APEX_NETLIFY="75.2.60.5"         # le répartiteur de Netlify pour un domaine racine
DOMAINE="anys.me"

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
non()  { printf '  \033[31m✗\033[0m %s\n' "$1"; ENNUIS=$((ENNUIS + 1)); }
tiede(){ printf '  \033[33m·\033[0m %s\n' "$1"; }
titre(){ printf '\n\033[1m%s\033[0m\n' "$1"; }

ENNUIS=0
chez_ovh() { dig +short +time=3 +tries=2 "@$AUTORITE" "$1" "$2" 2>/dev/null; }

titre "📬 Les mails — le plus important"
mx=$(chez_ovh "$DOMAINE" MX | sort)
if [ -z "$mx" ]; then
  non "AUCUN enregistrement MX. contact@$DOMAINE ne reçoit plus rien."
elif [[ $mx == *mail.ovh.net* ]]; then
  ok "MX intacts, toujours chez OVH :"
  printf '%s\n' "$mx" | sed 's/^/      /'
else
  non "Les MX ont changé et ne pointent plus vers OVH :"
  printf '%s\n' "$mx" | sed 's/^/      /'
fi

spf=$(chez_ovh "$DOMAINE" TXT | grep -i 'v=spf1')
if [ -n "$spf" ]; then ok "SPF en place : $spf"
else non "SPF disparu — tes mails risquent de partir en spam"; fi

dkim=$(chez_ovh "ovhmo-selector-1._domainkey.$DOMAINE" CNAME)
if [ -n "$dkim" ]; then ok "DKIM en place : tes mails sortants restent signés"
else tiede "DKIM introuvable — à vérifier si tes mails partent en spam"; fi

titre "🅰️ Le DNS, tel qu'OVH le sert"
a=$(chez_ovh "$DOMAINE" A | head -1)
if [ "$a" = "$APEX_NETLIFY" ]; then
  ok "$DOMAINE → $a (Netlify)"
elif [ -z "$a" ]; then
  non "$DOMAINE n'a plus d'enregistrement A"
else
  non "$DOMAINE → $a — attendu $APEX_NETLIFY"
fi

aaaa=$(chez_ovh "$DOMAINE" AAAA)
if [ -z "$aaaa" ]; then
  ok "pas d'AAAA : les visiteurs en IPv6 passent par le A"
else
  non "AAAA encore là ($aaaa) — tes visiteurs en IPv6 voient l'ancien WordPress"
fi

w=$(chez_ovh "www.$DOMAINE" A | head -1)
wc=$(chez_ovh "www.$DOMAINE" CNAME)
if [ "$w" = "$APEX_NETLIFY" ] || [[ $wc == *netlify* ]]; then
  ok "www.$DOMAINE arrive chez Netlify (il redirige ensuite vers $DOMAINE)"
else
  non "www.$DOMAINE : ni A vers $APEX_NETLIFY ni CNAME Netlify. Trouvé : ${w:-}${wc:-rien}"
fi

# Toutes les requêtes HTTP visent l'adresse qu'OVH sert vraiment, pour qu'un
# cache local périmé ne fasse pas passer une bascule réussie pour un échec.
cible=${a:-$APEX_NETLIFY}
vers()  { curl -s --max-time 20 --resolve "$DOMAINE:443:$cible" "https://$DOMAINE$1"; }
code()  { curl -s -o /dev/null -w '%{http_code}' --max-time 20 --resolve "$DOMAINE:443:$cible" "$@"; }

titre "🔒 Le certificat et les pages"
entetes=$(curl -sI --max-time 20 --resolve "$DOMAINE:443:$cible" "https://$DOMAINE/" 2>/dev/null)
if [ -z "$entetes" ]; then
  non "HTTPS ne répond pas — certificat Let's Encrypt pas encore émis par Netlify"
else
  ok "HTTPS répond sans erreur de certificat"
  serveur=$(printf '%s' "$entetes" | grep -i '^server:' | tr -d '\r')
  # tr plutôt que ${serveur,,} : macOS livre encore bash 3.2, qui ne connaît
  # pas la minusculisation par expansion et afficherait « bad substitution ».
  minuscules=$(printf '%s' "$serveur" | tr 'A-Z' 'a-z')
  if [[ $minuscules == *netlify* ]]; then
    ok "servi par Netlify"
  else
    non "servi par « ${serveur:-?} » — ce n'est pas Netlify, l'ancien site répond encore"
  fi
fi

# On cherche la balise, pas le nom de domaine : l'ancien WordPress embarque un
# script anti-cookies qui contient « cloud.umami.is » dans sa liste de blocage,
# et faisait passer le test au vert alors qu'il servait encore WordPress.
# On cherche dans la variable, sans tuyau. Chercher à travers un tuyau se
# trompe ici : grep ferme le tuyau dès qu'il a trouvé, ce qui tue l'écrivain
# d'un SIGPIPE sur une page de 94 Ko, et pipefail fait alors échouer le test
# au moment même où il réussissait.
accueil=$(vers /)
if [[ $accueil == *data-website-id* ]]; then
  ok "Umami est chargé sur l'accueil"
else
  non "Umami absent de l'accueil"
fi

# -L parce que les pages en dossier (/codex) renvoient un 301 vers /codex/ :
# c'est le bon comportement, et c'est le code final qui nous intéresse.
for p in /a-propos /agenda /contact /soins /codex /artefacts; do
  c=$(code -L "https://$DOMAINE$p")
  [ "$c" = "200" ] && ok "$p → 200" || non "$p → $c"
done

titre "🔁 Les redirections WordPress"
for duo in "/immersions:/in-carne" "/agenda-2/:/agenda" "/hello-world:/" "/wp-login.php:/" "/sitemap_index.xml:/sitemap-index.xml"; do
  de=${duo%%:*}; vise=${duo##*:}
  rep=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 20 \
        --resolve "$DOMAINE:443:$cible" "https://$DOMAINE$de")
  c=${rep%% *}; ou=${rep#* }
  if [ "$c" = "301" ] && [[ $ou == *"$DOMAINE$vise" ]]; then
    ok "$de → $vise"
  else
    non "$de : attendu 301 vers $vise, obtenu $c ${ou:-}"
  fi
done

titre "📝 Le formulaire"
c=$(code -X POST "https://$DOMAINE/.netlify/functions/formulaire")
case "$c" in
  400|422) ok "la fonction répond ($c sur un envoi vide : elle refuse, c'est bon)" ;;
  404|000) non "la fonction est introuvable ($c)" ;;
  *)       tiede "la fonction répond $c sur un envoi vide" ;;
esac

titre "🗺️ Le sitemap"
c=$(code "https://$DOMAINE/sitemap-index.xml")
[ "$c" = "200" ] && ok "sitemap-index.xml → 200" || non "sitemap-index.xml → $c"

titre "🏠 Et depuis cette machine, sans forcer l'adresse"
# On mesure l'adresse réellement jointe, pas celle que dig annonce : les deux
# diffèrent, parce que le système garde son propre cache, AAAA comprise. Une
# IPv6 périmée se sert la première et ramène l'ancien site.
reelle=$(curl -s --max-time 10 -o /dev/null -w '%{remote_ip}' "https://$DOMAINE/" 2>/dev/null)
if [ "$reelle" = "$APEX_NETLIFY" ]; then
  ok "ta machine joint bien Netlify ($reelle) : tu vois le site neuf"
else
  tiede "ta machine joint encore $reelle — son cache, jusqu'à une heure."
  tiede "Tu verras l'ancien site en attendant. Les résultats ci-dessus,"
  tiede "eux, viennent d'OVH : c'est ce que voit le reste du monde."
fi

printf '\n'
if [ "$ENNUIS" -eq 0 ]; then
  printf '\033[32m\033[1m  La bascule est faite. Rien à signaler.\033[0m\n\n'
else
  printf '\033[31m\033[1m  %s point(s) à regarder ci-dessus.\033[0m\n\n' "$ENNUIS"
fi
exit 0
