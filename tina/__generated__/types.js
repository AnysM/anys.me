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
  cta
  site
  lien
  resume
  image
  reservable
  ordre
  publie
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
  prix
  duree
  format
  tarifs {
    __typename
    label
    prix
    detail
  }
  image
  lien
  reservable
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
  hero_accent
  hero_paragraphe
  hero_cta
  piliers_titre
  citation1
  propositions_titre
  propositions {
    __typename
    titre
    texte
    cta
  }
  citation2
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
  chapitres {
    __typename
    titre
    texte
  }
}
    `;
export const Page_SoinsPartsFragmentDoc = gql`
    fragment Page_soinsParts on Page_soins {
  __typename
  hero_eyebrow
  hero_titre
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
  hero_image
  coeur
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
      url: "https://content.tinajs.io/3.0/content/ac005920-bdf5-45df-a7d6-5d99cc50423a/github/tina",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
