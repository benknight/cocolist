import { graphql, StaticQuery } from 'gatsby';
import React from 'react';
import Helmet from 'react-helmet';
import { IntlProvider as ReactIntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import vi from 'react-intl/locale-data/vi';
import { parseLangFromURL } from '../lib/i18n';

addLocaleData([...en, ...vi]);

const IntlProvider = props => (
  <StaticQuery
    query={graphql`
      {
        tx: allAirtable(filter: { table: { eq: "Translations" } }) {
          edges {
            node {
              data {
                key: Key
                en
                vi
              }
            }
          }
        }
        hoods: allAirtable(filter: { table: { eq: "Neighborhoods" } }) {
          edges {
            node {
              data {
                key: Name
                en: Name
                vi: Name_VI
              }
            }
          }
        }
        cities: allAirtable(filter: { table: { eq: "Cities" } }) {
          edges {
            node {
              data {
                key: Name
                en: Name
                vi: Name_VI
              }
            }
          }
        }
      }
    `}
    render={({ cities, hoods, tx }) => {
      const lang = parseLangFromURL(props.location.pathname);
      const messages = [...tx.edges, ...hoods.edges, ...cities.edges].reduce(
        (values, currentValue) => {
          const {
            node: { data },
          } = currentValue;
          values[data.key] = data[lang];
          return values;
        },
        {},
      );
      return (
        <ReactIntlProvider locale={lang} messages={messages}>
          <>
            <Helmet htmlAttributes={{ lang }} />
            {props.children}
          </>
        </ReactIntlProvider>
      );
    }}
  />
);

export default IntlProvider;
