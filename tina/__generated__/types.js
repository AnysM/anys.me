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
