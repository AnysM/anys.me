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
