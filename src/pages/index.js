import _get from 'lodash/get';
import _shuffle from 'lodash/shuffle';
import { Link, graphql } from 'gatsby';
import Img from 'gatsby-image';
import React from 'react';
import Helmet from 'react-helmet';
import { ThemedLink } from '@cocolist/thumbprint-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Header from '../components/Header';
import Page from '../components/Page';
import Search from '../components/Search';
import { badges } from '../lib/badges';
import { getLocalizedURL, parseLangFromURL } from '../lib/i18n';

const Index = ({ data, intl: { formatMessage }, location }) => {
  const lang = parseLangFromURL(location.pathname);
  return (
    <Page location={location} isPrivate>
      <Helmet>
        <title>Cocolist Saigon</title>
      </Helmet>
      <Header location={location} showSearch={false} />
      <div className="pv6 mv2 ph3 m_mv5 m_ph6 m_pv7 l_ph7 mw9">
        <div className="s_pr6 m_pr0 mw7">
          <h1 className="tp-title-1 mb3">
            <FormattedMessage
              id="find_businesses_headline"
              values={{ city: formatMessage({ id: 'Saigon' }) }}
            />
          </h1>
        </div>
        <Search className="relative z-1" location={location} />
      </div>
      {badges.map(badge => (
        <div
          className="flex flex-column l_flex-row items-center m_items-start mb4 m_mb6"
          key={badge.key}>
          <div className="m_flex items-center m_mv5 ph4 m_pl6 l_pl7 l_pr6 tc m_tl">
            <img
              alt={formatMessage({ id: badge.title })}
              src={require(`../assets/badges/${badge.imageLarge}`)}
            />
            <div className="m_ml3 m_pr7 l_pr0 mw7">
              <h2 className="tp-title-4">
                <FormattedMessage id={badge.title} />
              </h2>
              <div className="tp-body-1">
                <FormattedMessage
                  id={badge.description}
                  values={{ business: formatMessage({ id: 'generic_business_name' }) }}
                />
              </div>
            </div>
          </div>
          <div
            className="flex flex-nowrap overflow-auto w-100 ph3 l_ph0"
            style={{ WebkitOverflowScrolling: 'touch' }}>
            {_shuffle(
              data.surveys.edges
                .map(({ node: { data: survey } }) => survey)
                .filter(survey => badge.test(survey, true))
                .filter(survey => {
                  return !!_get(
                    survey,
                    'Business_Record_Match[0].data.Photos.localFiles[0].childImageSharp.fluid',
                  );
                }),
            ).map((survey, index) => {
              const biz = survey.Business_Record_Match[0].data;
              const thumbnail = _get(biz, 'Photos.localFiles[0].childImageSharp.fluid');
              return (
                <Link
                  className="db pr1 pv4 w6 flex-shrink-0"
                  key={index}
                  to={getLocalizedURL(`/${biz.URL_Key}`, lang)}>
                  {thumbnail && (
                    <Img
                      alt="business logo"
                      className="br2 overflow-hidden"
                      fluid={thumbnail}
                      objectFit="contain"
                    />
                  )}
                  <div className="tp-body-2 black mt1">
                    <div className="b">{biz.Name}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
      <div className="bg-gray-300 ph4 tc pv6">
        <div className="tp-title-2 mb5">
          <FormattedMessage id="add_business_headline" />
        </div>
        <ThemedLink to="https://airtable.com/shrw4zfDcry512acj" shouldOpenInNewTab>
          <FormattedMessage id="add_business_button_label" />
        </ThemedLink>
      </div>
    </Page>
  );
};

export const query = graphql`
  fragment HomepageSurveyFragment on AirtableEdge {
    node {
      data {
        Coco_Points
        Plastic_free_delivery
        No_plastic_straws
        No_plastic_bags
        BYO_container_discount
        Refill_my_bottle
        Food_waste_programs
        Kitchen_points
        Business_Record_Match {
          data {
            Name
            VNMM_Rating_Count
            URL_Key
            Photos {
              localFiles {
                childImageSharp {
                  fluid(maxWidth: 400, maxHeight: 250) {
                    ...GatsbyImageSharpFluid_noBase64
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  query {
    surveys: allAirtable(
      filter: {
        table: { eq: "Food & Beverage Survey" }
        data: {
          Business_Record_Match: { elemMatch: { data: { Record_ID: { ne: null } } } }
        }
      }
      sort: {
        fields: [
          data___Coco_Points
          data___Business_Record_Match___data___VNMM_Rating_Count
        ]
        order: DESC
      }
    ) {
      edges {
        ...HomepageSurveyFragment
      }
    }
  }
`;

export default injectIntl(Index);
