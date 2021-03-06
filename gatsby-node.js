/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
// require('dotenv').config();
const path = require('path');
const _ = require('lodash');
const { langs, defaultLang } = require('./src/lib/common/i18n');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const createPagesLangs = (component, slug, context) => {
    langs.forEach(lang => {
      // Only build pages for defaultLang in development to cut down build time
      if (process.env.NODE_ENV === 'development' && lang !== defaultLang) {
        return;
      }
      createPage({
        path: lang === defaultLang ? slug : `${lang}/${slug}`,
        component,
        context: {
          ...context,
          langKey: lang,
        },
      });
    });
  };

  const { data } = await graphql(`
    {
      businesses: allAirtable(filter: { table: { eq: "Survey" } }) {
        edges {
          node {
            data {
              URL
            }
          }
        }
      }
      cities: allAirtable(filter: { table: { eq: "Cities" } }) {
        edges {
          node {
            data {
              Name
              URL
            }
          }
        }
      }
    }
  `);

  const bizFiltered = data.businesses.edges.filter(
    edge => !!_.get(edge, 'node.data.URL'),
  );

  const bizGrouped = _.groupBy(bizFiltered, 'node.data.URL');

  console.log('Checking for URL key duplicates in survey data...');

  let hasDuplicates = false;

  Object.keys(bizGrouped).forEach(key => {
    if (bizGrouped[key].length > 1) {
      hasDuplicates = true;
      console.error(`Duplicate URL fields found for string "${key}"`);
    }
  });

  if (hasDuplicates) {
    process.exit(1);
  }

  console.log('Creating business pages...');

  // Load templates
  const BusinessPage = path.resolve('./src/templates/BusinessPage.js');
  const CityPage = path.resolve('./src/templates/CityPage.js');
  const ListPage = path.resolve('./src/templates/ListPage.js');

  bizFiltered.forEach(({ node }) => {
    createPagesLangs(BusinessPage, node.data.URL, {
      slug: node.data.URL,
    });
  });

  const listPages = [
    'byoc',
    'green-delivery',
    'food-waste',
    'vegetarian',
    'no-plastic-bags',
    'no-plastic-bottles',
    'no-plastic-straws',
    'free-drinking-water',
  ];

  console.log('Creating city & list pages...');

  data.cities.edges.forEach(({ node: { data: city } }) => {
    createPagesLangs(CityPage, city.URL, { city: city.Name, slug: city.URL });

    // console.log(`Building list pages for ${city.Name}...`);

    // Create list pages for city
    listPages.forEach(listSlug => {
      const context = {
        city: city.Name,
        citySlug: city.URL,
        slug: listSlug,
      };
      createPagesLangs(ListPage, `${city.URL}/${listSlug}`, context);
    });
  });
};

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions;
  deletePage(page);
  langs.forEach(lang => {
    const langPage = {
      ...page,
      path: lang === defaultLang ? page.path : `/${lang}${page.path}`,
      context: {
        ...page.context,
        langKey: lang,
      },
    };
    createPage(langPage);
  });
};
