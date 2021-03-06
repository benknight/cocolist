import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import Helmet from 'react-helmet';
import { IntlProvider as ReactIntlProvider } from 'react-intl';
import { parseLangFromURL } from '../lib/common/i18n';

if (!Intl.PluralRules) {
  require('@formatjs/intl-pluralrules/polyfill');
  require('@formatjs/intl-pluralrules/dist/locale-data/en');
  require('@formatjs/intl-pluralrules/dist/locale-data/vi');
  require('@formatjs/intl-pluralrules/dist/locale-data/km');
}

if (!Intl.RelativeTimeFormat) {
  require('@formatjs/intl-relativetimeformat/polyfill');
  require('@formatjs/intl-relativetimeformat/dist/locale-data/en');
  require('@formatjs/intl-relativetimeformat/dist/locale-data/vi');
  require('@formatjs/intl-relativetimeformat/dist/locale-data/km');
}

function onError(err) {
  if (process.env.NODE_ENV === 'production') {
    console.warn(err);
  }
}

const IntlProvider = props => {
  const { tx } = useStaticQuery(graphql`
    {
      tx: allAirtable(filter: { table: { eq: "Messages" } }) {
        edges {
          node {
            data {
              key: Key
              en
              vi
              km
            }
          }
        }
      }
    }
  `);
  const lang = parseLangFromURL(props.location.pathname);
  const messages = tx.edges.reduce((values, currentValue) => {
    const {
      node: { data },
    } = currentValue;
    values[data.key] = data[lang];
    return values;
  }, {});
  return (
    <ReactIntlProvider locale={lang} messages={messages} onError={onError}>
      <>
        <Helmet htmlAttributes={{ lang }} />
        {props.children}
      </>
    </ReactIntlProvider>
  );
};

export default IntlProvider;
