export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const AgendaPartsFragmentDoc = gql`
    fragment AgendaParts on Agenda {
  __typename
  titre
  categorie
  date
  date_fin
  rythme
  heure
  lieu
  prix
  earlybird
  seances {
    __typename
    date
    heure
    note
  }
  tarifs {
    __typename
    label
    prix
    detail
    avant
  }
  cta
  site
  lien
  resume
  citations {
    __typename
    texte
    source
    image
  }
  image
  image_hero
  accroche
  reservable
  ordre
  publie
  temoignages {
    __typename
    t
    n
    c
  }
  faq {
    __typename
    q
    r
  }
  accueil
  seuil
  body
}
    `;
export const OffresPartsFragmentDoc = gql`
    fragment OffresParts on Offres {
  __typename
  titre
  categorie
  tag
  resume
  accroche
  prix
  duree
  format
  tarifs {
    __typename
    label
    prix
    detail
    groupe
    avant
  }
  etapes {
    __typename
    titre
    texte
    picto
  }
  image
  lien
  reservable
  ordre
  publie
  temoignages {
    __typename
    t
    n
    c
  }
  faq {
    __typename
    q
    r
  }
  benefices
  pourqui_titre
  pourqui
  pourtoi
  pourtoi_note
  places
  pourtoi_contre_titre
  pourtoi_contre
  masques_titre
  masques
  chemin_eyebrow
  chemin_titre
  chemin
  chemin_appuis
  approche_eyebrow
  approche_titre
  approche_intro
  approche {
    __typename
    titre
    cadence
    texte
  }
  cap_eyebrow
  cap_titre
  cap {
    __typename
    titre
    posture
    texte
  }
  cadre
  cadre_items {
    __typename
    titre
    texte
  }
  explore
  action
  cta
  logo
  page
  intention_eyebrow
  intention
  nom_titre
  nom_texte
  cap_note
  temoins_titre
  invite_titre
  invite_texte
  accueil
  seuil
  body
}
    `;
export const CodexPartsFragmentDoc = gql`
    fragment CodexParts on Codex {
  __typename
  titre
  type
  univers
  question
  resume
  alias
  offres {
    __typename
    offre {
      ... on Offres {
        __typename
        titre
        categorie
        tag
        resume
        accroche
        prix
        duree
        format
        tarifs {
          __typename
          label
          prix
          detail
          groupe
          avant
        }
        etapes {
          __typename
          titre
          texte
          picto
        }
        image
        lien
        reservable
        ordre
        publie
        temoignages {
          __typename
          t
          n
          c
        }
        faq {
          __typename
          q
          r
        }
        benefices
        pourqui_titre
        pourqui
        pourtoi
        pourtoi_note
        places
        pourtoi_contre_titre
        pourtoi_contre
        masques_titre
        masques
        chemin_eyebrow
        chemin_titre
        chemin
        chemin_appuis
        approche_eyebrow
        approche_titre
        approche_intro
        approche {
          __typename
          titre
          cadence
          texte
        }
        cap_eyebrow
        cap_titre
        cap {
          __typename
          titre
          posture
          texte
        }
        cadre
        cadre_items {
          __typename
          titre
          texte
        }
        explore
        action
        cta
        logo
        page
        intention_eyebrow
        intention
        nom_titre
        nom_texte
        cap_note
        temoins_titre
        invite_titre
        invite_texte
        accueil
        seuil
        body
      }
      ... on Document {
        _sys {
          filename
          basename
          hasReferences
          breadcrumbs
          path
          relativePath
          extension
        }
        id
      }
    }
  }
  agenda {
    __typename
    evenement {
      ... on Agenda {
        __typename
        titre
        categorie
        date
        date_fin
        rythme
        heure
        lieu
        prix
        earlybird
        seances {
          __typename
          date
          heure
          note
        }
        tarifs {
          __typename
          label
          prix
          detail
          avant
        }
        cta
        site
        lien
        resume
        citations {
          __typename
          texte
          source
          image
        }
        image
        image_hero
        accroche
        reservable
        ordre
        publie
        temoignages {
          __typename
          t
          n
          c
        }
        faq {
          __typename
          q
          r
        }
        accueil
        seuil
        body
      }
      ... on Document {
        _sys {
          filename
          basename
          hasReferences
          breadcrumbs
          path
          relativePath
          extension
        }
        id
      }
    }
  }
  liens {
    __typename
    fiche {
      ... on Codex {
        __typename
        titre
        type
        univers
        question
        resume
        alias
        offres {
          __typename
          offre {
            ... on Offres {
              __typename
              titre
              categorie
              tag
              resume
              accroche
              prix
              duree
              format
              tarifs {
                __typename
                label
                prix
                detail
                groupe
                avant
              }
              etapes {
                __typename
                titre
                texte
                picto
              }
              image
              lien
              reservable
              ordre
              publie
              temoignages {
                __typename
                t
                n
                c
              }
              faq {
                __typename
                q
                r
              }
              benefices
              pourqui_titre
              pourqui
              pourtoi
              pourtoi_note
              places
              pourtoi_contre_titre
              pourtoi_contre
              masques_titre
              masques
              chemin_eyebrow
              chemin_titre
              chemin
              chemin_appuis
              approche_eyebrow
              approche_titre
              approche_intro
              approche {
                __typename
                titre
                cadence
                texte
              }
              cap_eyebrow
              cap_titre
              cap {
                __typename
                titre
                posture
                texte
              }
              cadre
              cadre_items {
                __typename
                titre
                texte
              }
              explore
              action
              cta
              logo
              page
              intention_eyebrow
              intention
              nom_titre
              nom_texte
              cap_note
              temoins_titre
              invite_titre
              invite_texte
              accueil
              seuil
              body
            }
            ... on Document {
              _sys {
                filename
                basename
                hasReferences
                breadcrumbs
                path
                relativePath
                extension
              }
              id
            }
          }
        }
        agenda {
          __typename
          evenement {
            ... on Agenda {
              __typename
              titre
              categorie
              date
              date_fin
              rythme
              heure
              lieu
              prix
              earlybird
              seances {
                __typename
                date
                heure
                note
              }
              tarifs {
                __typename
                label
                prix
                detail
                avant
              }
              cta
              site
              lien
              resume
              citations {
                __typename
                texte
                source
                image
              }
              image
              image_hero
              accroche
              reservable
              ordre
              publie
              temoignages {
                __typename
                t
                n
                c
              }
              faq {
                __typename
                q
                r
              }
              accueil
              seuil
              body
            }
            ... on Document {
              _sys {
                filename
                basename
                hasReferences
                breadcrumbs
                path
                relativePath
                extension
              }
              id
            }
          }
        }
        liens {
          __typename
          fiche {
            ... on Codex {
              __typename
              titre
              type
              univers
              question
              resume
              alias
              offres {
                __typename
              }
              agenda {
                __typename
              }
              liens {
                __typename
              }
              image
              lien_externe
              logo
              logo_blanc
              date
              seo_titre
              seo_description
              ordre
              publie
              body
            }
            ... on Document {
              _sys {
                filename
                basename
                hasReferences
                breadcrumbs
                path
                relativePath
                extension
              }
              id
            }
          }
        }
        image
        lien_externe
        logo
        logo_blanc
        date
        seo_titre
        seo_description
        ordre
        publie
        body
      }
      ... on Document {
        _sys {
          filename
          basename
          hasReferences
          breadcrumbs
          path
          relativePath
          extension
        }
        id
      }
    }
  }
  image
  lien_externe
  logo
  logo_blanc
  date
  seo_titre
  seo_description
  ordre
  publie
  body
}
    `;
export const ArtefactsPartsFragmentDoc = gql`
    fragment ArtefactsParts on Artefacts {
  __typename
  titre
  sous_titre
  images
  naissance
  annee
  technique
  dimensions
  codex {
    __typename
    fiche {
      ... on Codex {
        __typename
        titre
        type
        univers
        question
        resume
        alias
        offres {
          __typename
          offre {
            ... on Offres {
              __typename
              titre
              categorie
              tag
              resume
              accroche
              prix
              duree
              format
              tarifs {
                __typename
                label
                prix
                detail
                groupe
                avant
              }
              etapes {
                __typename
                titre
                texte
                picto
              }
              image
              lien
              reservable
              ordre
              publie
              temoignages {
                __typename
                t
                n
                c
              }
              faq {
                __typename
                q
                r
              }
              benefices
              pourqui_titre
              pourqui
              pourtoi
              pourtoi_note
              places
              pourtoi_contre_titre
              pourtoi_contre
              masques_titre
              masques
              chemin_eyebrow
              chemin_titre
              chemin
              chemin_appuis
              approche_eyebrow
              approche_titre
              approche_intro
              approche {
                __typename
                titre
                cadence
                texte
              }
              cap_eyebrow
              cap_titre
              cap {
                __typename
                titre
                posture
                texte
              }
              cadre
              cadre_items {
                __typename
                titre
                texte
              }
              explore
              action
              cta
              logo
              page
              intention_eyebrow
              intention
              nom_titre
              nom_texte
              cap_note
              temoins_titre
              invite_titre
              invite_texte
              accueil
              seuil
              body
            }
            ... on Document {
              _sys {
                filename
                basename
                hasReferences
                breadcrumbs
                path
                relativePath
                extension
              }
              id
            }
          }
        }
        agenda {
          __typename
          evenement {
            ... on Agenda {
              __typename
              titre
              categorie
              date
              date_fin
              rythme
              heure
              lieu
              prix
              earlybird
              seances {
                __typename
                date
                heure
                note
              }
              tarifs {
                __typename
                label
                prix
                detail
                avant
              }
              cta
              site
              lien
              resume
              citations {
                __typename
                texte
                source
                image
              }
              image
              image_hero
              accroche
              reservable
              ordre
              publie
              temoignages {
                __typename
                t
                n
                c
              }
              faq {
                __typename
                q
                r
              }
              accueil
              seuil
              body
            }
            ... on Document {
              _sys {
                filename
                basename
                hasReferences
                breadcrumbs
                path
                relativePath
                extension
              }
              id
            }
          }
        }
        liens {
          __typename
          fiche {
            ... on Codex {
              __typename
              titre
              type
              univers
              question
              resume
              alias
              offres {
                __typename
              }
              agenda {
                __typename
              }
              liens {
                __typename
              }
              image
              lien_externe
              logo
              logo_blanc
              date
              seo_titre
              seo_description
              ordre
              publie
              body
            }
            ... on Document {
              _sys {
                filename
                basename
                hasReferences
                breadcrumbs
                path
                relativePath
                extension
              }
              id
            }
          }
        }
        image
        lien_externe
        logo
        logo_blanc
        date
        seo_titre
        seo_description
        ordre
        publie
        body
      }
      ... on Document {
        _sys {
          filename
          basename
          hasReferences
          breadcrumbs
          path
          relativePath
          extension
        }
        id
      }
    }
  }
  original
  original_prix
  lien_boutique
  tirages_statut
  tirages {
    __typename
    format
    prix
    detail
  }
  ordre
  publie
  body
}
    `;
export const PagesPartsFragmentDoc = gql`
    fragment PagesParts on Pages {
  __typename
  hero_eyebrow
  hero_titre
  hero_image
  portrait_image
  resp1_image
  resp2_image
  resp3_image
  art_fond
  art_phrase
  art1_image
  art2_image
  art3_image
  art4_image
  hero_accent
  hero_paragraphe
  hero_cta
  parcours_titre
  parcours_texte
  parcours_cta
  coeur_eyebrow
  coeur_titre
  coeur
  venir_eyebrow
  venir_titre
  venir_items
  posture
  difference_eyebrow
  difference_titre
  difference {
    __typename
    titre
    piege
    texte
  }
  piliers_eyebrow
  agenda_eyebrow
  agenda_titre
  art_eyebrow
  art_titre
  temoins_eyebrow
  temoins_image
  avis_note
  avis_nombre
  avis_lien
  temoins {
    __typename
    t
    n
    c
  }
  form_eyebrow
  piliers_titre
  piliers_centre
  piliers {
    __typename
    nom
    note
    picto
  }
  citation1
  seuils_eyebrow
  seuils_titre
  seuils {
    __typename
    titre
    texte
  }
  codex_eyebrow
  codex_titre
  codex_texte
  citation2
  citation3
  citation_contact
  form_titre
  form_intro
}
    `;
export const Page_AproposPartsFragmentDoc = gql`
    fragment Page_aproposParts on Page_apropos {
  __typename
  hero_eyebrow
  hero_titre
  hero_image
  chapitres {
    __typename
    titre
    texte
    image
    echos {
      __typename
      fiche {
        ... on Codex {
          __typename
          titre
          type
          univers
          question
          resume
          alias
          offres {
            __typename
            offre {
              ... on Offres {
                __typename
                titre
                categorie
                tag
                resume
                accroche
                prix
                duree
                format
                tarifs {
                  __typename
                  label
                  prix
                  detail
                  groupe
                  avant
                }
                etapes {
                  __typename
                  titre
                  texte
                  picto
                }
                image
                lien
                reservable
                ordre
                publie
                temoignages {
                  __typename
                  t
                  n
                  c
                }
                faq {
                  __typename
                  q
                  r
                }
                benefices
                pourqui_titre
                pourqui
                pourtoi
                pourtoi_note
                places
                pourtoi_contre_titre
                pourtoi_contre
                masques_titre
                masques
                chemin_eyebrow
                chemin_titre
                chemin
                chemin_appuis
                approche_eyebrow
                approche_titre
                approche_intro
                approche {
                  __typename
                  titre
                  cadence
                  texte
                }
                cap_eyebrow
                cap_titre
                cap {
                  __typename
                  titre
                  posture
                  texte
                }
                cadre
                cadre_items {
                  __typename
                  titre
                  texte
                }
                explore
                action
                cta
                logo
                page
                intention_eyebrow
                intention
                nom_titre
                nom_texte
                cap_note
                temoins_titre
                invite_titre
                invite_texte
                accueil
                seuil
                body
              }
              ... on Document {
                _sys {
                  filename
                  basename
                  hasReferences
                  breadcrumbs
                  path
                  relativePath
                  extension
                }
                id
              }
            }
          }
          agenda {
            __typename
            evenement {
              ... on Agenda {
                __typename
                titre
                categorie
                date
                date_fin
                rythme
                heure
                lieu
                prix
                earlybird
                seances {
                  __typename
                  date
                  heure
                  note
                }
                tarifs {
                  __typename
                  label
                  prix
                  detail
                  avant
                }
                cta
                site
                lien
                resume
                citations {
                  __typename
                  texte
                  source
                  image
                }
                image
                image_hero
                accroche
                reservable
                ordre
                publie
                temoignages {
                  __typename
                  t
                  n
                  c
                }
                faq {
                  __typename
                  q
                  r
                }
                accueil
                seuil
                body
              }
              ... on Document {
                _sys {
                  filename
                  basename
                  hasReferences
                  breadcrumbs
                  path
                  relativePath
                  extension
                }
                id
              }
            }
          }
          liens {
            __typename
            fiche {
              ... on Codex {
                __typename
                titre
                type
                univers
                question
                resume
                alias
                offres {
                  __typename
                }
                agenda {
                  __typename
                }
                liens {
                  __typename
                }
                image
                lien_externe
                logo
                logo_blanc
                date
                seo_titre
                seo_description
                ordre
                publie
                body
              }
              ... on Document {
                _sys {
                  filename
                  basename
                  hasReferences
                  breadcrumbs
                  path
                  relativePath
                  extension
                }
                id
              }
            }
          }
          image
          lien_externe
          logo
          logo_blanc
          date
          seo_titre
          seo_description
          ordre
          publie
          body
        }
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
      }
    }
  }
}
    `;
export const Page_SoinsPartsFragmentDoc = gql`
    fragment Page_soinsParts on Page_soins {
  __typename
  hero_eyebrow
  hero_titre
  hero_image
  portrait_image
  coeur
  soins_eyebrow
  soins_titre
  soins_intro
}
    `;
export const Page_AccompagnementPartsFragmentDoc = gql`
    fragment Page_accompagnementParts on Page_accompagnement {
  __typename
  hero_eyebrow
  hero_titre
  coeur
  hero_image
  portrait_image
  outils_image
  pourqui_eyebrow
  pourqui_titre
  pourqui_texte
  outils_eyebrow
  outils_titre
  outils
  passage
  formules_eyebrow
  formules_titre
}
    `;
export const Page_QuintessencePartsFragmentDoc = gql`
    fragment Page_quintessenceParts on Page_quintessence {
  __typename
  hero_eyebrow
  hero_titre
  hero_lead
  hero_image
  silence_image
  crea_image
  resp_image
  fin_image
  passage
  citation
  silence_titre
  silence_texte
  crea_titre
  crea_texte
  pratiques_eyebrow
  pratiques_titre
  pratiques
  cta_texte
}
    `;
export const Page_ContactPartsFragmentDoc = gql`
    fragment Page_contactParts on Page_contact {
  __typename
  hero_eyebrow
  hero_titre
  hero_image
  intro
  appel_eyebrow
  appel_texte
  appel_cta
  appel_lien
  appel_mention
}
    `;
export const Page_AgendaPartsFragmentDoc = gql`
    fragment Page_agendaParts on Page_agenda {
  __typename
  hero_eyebrow
  hero_titre
  hero_image
}
    `;
export const AgendaDocument = gql`
    query agenda($relativePath: String!) {
  agenda(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...AgendaParts
  }
}
    ${AgendaPartsFragmentDoc}`;
export const AgendaConnectionDocument = gql`
    query agendaConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: AgendaFilter) {
  agendaConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...AgendaParts
      }
    }
  }
}
    ${AgendaPartsFragmentDoc}`;
export const OffresDocument = gql`
    query offres($relativePath: String!) {
  offres(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...OffresParts
  }
}
    ${OffresPartsFragmentDoc}`;
export const OffresConnectionDocument = gql`
    query offresConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: OffresFilter) {
  offresConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...OffresParts
      }
    }
  }
}
    ${OffresPartsFragmentDoc}`;
export const CodexDocument = gql`
    query codex($relativePath: String!) {
  codex(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...CodexParts
  }
}
    ${CodexPartsFragmentDoc}`;
export const CodexConnectionDocument = gql`
    query codexConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: CodexFilter) {
  codexConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...CodexParts
      }
    }
  }
}
    ${CodexPartsFragmentDoc}`;
export const ArtefactsDocument = gql`
    query artefacts($relativePath: String!) {
  artefacts(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ArtefactsParts
  }
}
    ${ArtefactsPartsFragmentDoc}`;
export const ArtefactsConnectionDocument = gql`
    query artefactsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: ArtefactsFilter) {
  artefactsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...ArtefactsParts
      }
    }
  }
}
    ${ArtefactsPartsFragmentDoc}`;
export const PagesDocument = gql`
    query pages($relativePath: String!) {
  pages(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PagesParts
  }
}
    ${PagesPartsFragmentDoc}`;
export const PagesConnectionDocument = gql`
    query pagesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PagesFilter) {
  pagesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PagesParts
      }
    }
  }
}
    ${PagesPartsFragmentDoc}`;
export const Page_AproposDocument = gql`
    query page_apropos($relativePath: String!) {
  page_apropos(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Page_aproposParts
  }
}
    ${Page_AproposPartsFragmentDoc}`;
export const Page_AproposConnectionDocument = gql`
    query page_aproposConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Page_aproposFilter) {
  page_aproposConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Page_aproposParts
      }
    }
  }
}
    ${Page_AproposPartsFragmentDoc}`;
export const Page_SoinsDocument = gql`
    query page_soins($relativePath: String!) {
  page_soins(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Page_soinsParts
  }
}
    ${Page_SoinsPartsFragmentDoc}`;
export const Page_SoinsConnectionDocument = gql`
    query page_soinsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Page_soinsFilter) {
  page_soinsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Page_soinsParts
      }
    }
  }
}
    ${Page_SoinsPartsFragmentDoc}`;
export const Page_AccompagnementDocument = gql`
    query page_accompagnement($relativePath: String!) {
  page_accompagnement(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Page_accompagnementParts
  }
}
    ${Page_AccompagnementPartsFragmentDoc}`;
export const Page_AccompagnementConnectionDocument = gql`
    query page_accompagnementConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Page_accompagnementFilter) {
  page_accompagnementConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Page_accompagnementParts
      }
    }
  }
}
    ${Page_AccompagnementPartsFragmentDoc}`;
export const Page_QuintessenceDocument = gql`
    query page_quintessence($relativePath: String!) {
  page_quintessence(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Page_quintessenceParts
  }
}
    ${Page_QuintessencePartsFragmentDoc}`;
export const Page_QuintessenceConnectionDocument = gql`
    query page_quintessenceConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Page_quintessenceFilter) {
  page_quintessenceConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Page_quintessenceParts
      }
    }
  }
}
    ${Page_QuintessencePartsFragmentDoc}`;
export const Page_ContactDocument = gql`
    query page_contact($relativePath: String!) {
  page_contact(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Page_contactParts
  }
}
    ${Page_ContactPartsFragmentDoc}`;
export const Page_ContactConnectionDocument = gql`
    query page_contactConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Page_contactFilter) {
  page_contactConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Page_contactParts
      }
    }
  }
}
    ${Page_ContactPartsFragmentDoc}`;
export const Page_AgendaDocument = gql`
    query page_agenda($relativePath: String!) {
  page_agenda(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Page_agendaParts
  }
}
    ${Page_AgendaPartsFragmentDoc}`;
export const Page_AgendaConnectionDocument = gql`
    query page_agendaConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Page_agendaFilter) {
  page_agendaConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Page_agendaParts
      }
    }
  }
}
    ${Page_AgendaPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    agenda(variables, options) {
      return requester(AgendaDocument, variables, options);
    },
    agendaConnection(variables, options) {
      return requester(AgendaConnectionDocument, variables, options);
    },
    offres(variables, options) {
      return requester(OffresDocument, variables, options);
    },
    offresConnection(variables, options) {
      return requester(OffresConnectionDocument, variables, options);
    },
    codex(variables, options) {
      return requester(CodexDocument, variables, options);
    },
    codexConnection(variables, options) {
      return requester(CodexConnectionDocument, variables, options);
    },
    artefacts(variables, options) {
      return requester(ArtefactsDocument, variables, options);
    },
    artefactsConnection(variables, options) {
      return requester(ArtefactsConnectionDocument, variables, options);
    },
    pages(variables, options) {
      return requester(PagesDocument, variables, options);
    },
    pagesConnection(variables, options) {
      return requester(PagesConnectionDocument, variables, options);
    },
    page_apropos(variables, options) {
      return requester(Page_AproposDocument, variables, options);
    },
    page_aproposConnection(variables, options) {
      return requester(Page_AproposConnectionDocument, variables, options);
    },
    page_soins(variables, options) {
      return requester(Page_SoinsDocument, variables, options);
    },
    page_soinsConnection(variables, options) {
      return requester(Page_SoinsConnectionDocument, variables, options);
    },
    page_accompagnement(variables, options) {
      return requester(Page_AccompagnementDocument, variables, options);
    },
    page_accompagnementConnection(variables, options) {
      return requester(Page_AccompagnementConnectionDocument, variables, options);
    },
    page_quintessence(variables, options) {
      return requester(Page_QuintessenceDocument, variables, options);
    },
    page_quintessenceConnection(variables, options) {
      return requester(Page_QuintessenceConnectionDocument, variables, options);
    },
    page_contact(variables, options) {
      return requester(Page_ContactDocument, variables, options);
    },
    page_contactConnection(variables, options) {
      return requester(Page_ContactConnectionDocument, variables, options);
    },
    page_agenda(variables, options) {
      return requester(Page_AgendaDocument, variables, options);
    },
    page_agendaConnection(variables, options) {
      return requester(Page_AgendaConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
