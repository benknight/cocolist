import cx from 'classnames';
import { graphql } from 'gatsby';
import Img from 'gatsby-image';
import _mean from 'lodash/mean';
import React, { useState, useEffect } from 'react';
import Helmet from 'react-helmet';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  ContentActionsEditSmall,
  ContentModifierMapPinSmall,
  ContentModifierListSmall,
  FeatureBookmarkSmall,
  SocialFacebookSmall,
} from '@thumbtack/thumbprint-icons';
import { TextButton } from '@thumbtack/thumbprint-react';
import Categories from '../components/Categories';
import Header from '../components/Header';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';
import getBizPresenter from '../lib/common/getBizPresenter';
import cleanUrl from '../lib/cleanUrl';
import getSurveyDetails from '../lib/getSurveyDetails';
import useFirebase from '../lib/useFirebase';
import useCitySelection from '../lib/useCitySelection';
import styles from './BusinessPage.module.scss';

export const query = graphql`
  fragment SurveyDataFragment on AirtableData {
    From_the_business
    From_the_editor
    Coco_points
    Dine_in_points
    Take_out_points
    Kitchen_points
    Menu_points
    No_plastic_straws
    No_plastic_bags
    No_plastic_bottles
    BYO_container_discount
    BYOC_discount_amount
    Free_drinking_water
    Green_delivery
    Delivery_only
    Dine_in_straws
    Dine_in_utensils
    Dine_in_napkins
    Dine_in_drink_containers
    Dine_in_cups
    Dine_in_drink_stirrers
    Dine_in_linens__table_or_placemats_
    Dine_in_dishes
    Restroom_hand_towels
    Take_out_bags
    Take_out_containers
    Take_out_cups
    Take_out_container_lids
    Take_out_cup_lids
    Take_out_straws
    Take_out_cup_carriers
    Take_out_cup_sleeves
    Take_out_food_wrapping
    Kitchen_piping_bags
    Kitchen_pan_liners
    Kitchen_food_wrapping
    Kitchen_gloves
    Kitchen_food_freeze_packaging
    Kitchen_waste_management
    Food_waste_programs
    Menu
    Miscellaneous
    Status
    Survey_prefill_query_string
    Attachments {
      localFiles {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed_withWebp_noBase64
          }
        }
      }
      raw {
        filename
        url
        thumbnails {
          large {
            url
          }
        }
      }
    }
  }

  fragment BusinessDataFragment on AirtableData {
    Record_ID
    Name
    Facebook_link
    Website
    URL
    Category {
      data {
        Name
      }
    }
    Neighborhood {
      data {
        Name
        City {
          data {
            Name
          }
        }
      }
    }
    Locations {
      data {
        Name
        Neighborhood {
          data {
            Name
            City {
              data {
                Name
              }
            }
          }
        }
      }
    }
    Cover_photo {
      localFiles {
        childImageSharp {
          fluid(maxWidth: 600, maxHeight: 360, cropFocus: CENTER) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
    Profile_photo {
      localFiles {
        childImageSharp {
          fluid(maxWidth: 135, maxHeight: 135, cropFocus: CENTER) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
    ...SurveyDataFragment
  }

  query($slug: String!) {
    airtable(table: { eq: "Survey" }, data: { URL: { eq: $slug } }) {
      data {
        ...BusinessDataFragment
      }
    }
  }
`;

const BusinessPage = props => {
  const {
    data: {
      airtable: { data: bizData },
    },
    pageContext: { langKey },
  } = props;

  const firebase = useFirebase();
  const { formatMessage } = useIntl();
  const biz = getBizPresenter(bizData, langKey);
  const [selectedCity] = useCitySelection();
  const localNeighborhoods = selectedCity
    ? biz.neighborhoods
        .filter(hood => hood.City[0].data.Name === selectedCity.name)
        .map(hood => formatMessage({ id: hood.Name }))
    : [];
  const details = getSurveyDetails(bizData);
  const [reviews, setReviews] = useState(null);
  const reviewsMean =
    reviews && reviews.length > 0 ? _mean(reviews.map(r => r.rating)).toFixed(1) : null;

  useEffect(() => {
    let isMounted = true;
    firebase
      .firestore()
      .collection('reviews')
      .where('business.id', '==', biz.url)
      .get()
      .then(snapshot => {
        if (isMounted) {
          const reviews = [];
          snapshot.forEach(doc => reviews.push({ id: doc.id, ...doc.data() }));
          setReviews(reviews);
        }
      })
      .catch(error => {
        console.error(error);
        if (isMounted) {
          setReviews(false);
        }
      });
    return () => (isMounted = false);
  }, [firebase, biz.url]);

  const airtableForm = `https://airtable.com/shrw4zfDcry512acj?${bizData.Survey_prefill_query_string}`;

  return (
    <div className="bg-gray-200">
      <Helmet>
        <title>{biz.name} &ndash; Cocolist</title>
        {/* TODO: Add social meta tags */}
      </Helmet>

      <Header location={props.location} />

      <div className={cx(styles.container, 'shadow-1 center bg-white')}>
        <div className="mb4">
          <div className={cx(styles.sidebar, 'flex-shrink-0 order-1 self-end')}>
            {biz.coverPhoto && (
              <div className={styles.thumbnailWrapper}>
                <Img alt="logo" fluid={biz.coverPhoto} objectFit="contain" />
              </div>
            )}
          </div>
          <div className="relative ph3 s_ph5 order-0">
            {biz.profilePhoto && (
              <Img
                alt={formatMessage({ id: 'profile_photo_alt_text' }, { biz: biz.name })}
                className={cx(styles.profilePhoto, 'br2 overflow-hidden w-25 mt2 ml2')}
                fluid={biz.profilePhoto}
                objectFit="contain"
              />
            )}
            <div className="flex items-end mb2 mt3 s_mt4">
              <h1 className="tp-title-1 flex-auto">{biz.name}</h1>
            </div>
            <div className="tp-body-2">
              {reviews && reviews.length > 0 && (
                <div className="flex items-center mb2">
                  <StarRating rating={reviewsMean} size="small" />
                  <span className="ml1 black-300">
                    {reviewsMean} ({reviews.length})
                  </span>
                </div>
              )}
              <div className="flex items-start">
                <ContentModifierListSmall className="w1 mr2" />
                <div>
                  <Categories categories={biz.categories} />
                </div>
              </div>
              <div className="flex items-center mv1">
                <ContentModifierMapPinSmall className="w1 mr2" />
                {localNeighborhoods.length > 0 ? (
                  <div>{localNeighborhoods.join(', ')}</div>
                ) : (
                  <div>
                    {biz.cities.map((city, index) => (
                      <React.Fragment key={index}>
                        <FormattedMessage id={city.Name} />
                        {index === biz.cities.length - 1 ? '' : ', '}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              {biz.facebookLink && (
                <div className="flex items-center mv1">
                  <SocialFacebookSmall className="w1 mr2" />
                  <a href={biz.facebookLink}>{cleanUrl(biz.facebookLink)}</a>
                </div>
              )}
              {biz.website && (
                <div className="flex items-center mv1">
                  <FeatureBookmarkSmall className="w1 mr2" />
                  <a href={biz.website}>{cleanUrl(biz.website)}</a>
                </div>
              )}
            </div>
            <div className="tp-body-2 mv1">
              <TextButton
                accessibilityLabel={formatMessage({ id: 'edit_business_action_label' })}
                onClick={() => window.open(airtableForm)}
                iconLeft={<ContentActionsEditSmall className="w1" />}
                theme="inherit">
                <FormattedMessage id="edit_business_action_label" />
              </TextButton>
            </div>
          </div>
        </div>

        <div className="ph3 s_ph5 pb5">
          <div className="flex-auto">
            {biz.badges.length > 0 && (
              <div className="mv4">
                {biz.badges.map(badge => (
                  <div key={badge.key} className="flex items-center pv3">
                    <div
                      className={cx(styles.badgeImage, 'self-start flex-shrink-0 mr3')}>
                      <img
                        alt=""
                        className="dib w-100"
                        src={require(`../assets/badges/${badge.imageSmall}`)}
                      />
                    </div>
                    <div>
                      <div className="tp-title-5" size={5}>
                        <FormattedMessage id={badge.title} />
                      </div>
                      {badge.description && (
                        <div className="tp-body-2 measure">
                          <FormattedMessage
                            id={badge.description}
                            values={{
                              business: biz.name,
                              byoc_discount: biz.byocDiscountAmount || '',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Business photos */}

            {biz.photos.length > 0 && (
              <div className="mb5">
                <div className="tp-title-4 mb3">
                  <FormattedMessage id="business_photos_heading" />
                </div>
                {biz.photos.map((photo, index) => {
                  return (
                    <a
                      className="dib ml0-m mt1 mr1"
                      href={photo.raw.thumbnails.large.url}
                      key={index}
                      rel="noopener noreferrer"
                      target="_blank">
                      <Img alt={photo.raw.filename} className="br1" fixed={photo.fixed} />
                    </a>
                  );
                })}
              </div>
            )}

            {/* From the business */}

            {biz.fromTheBusiness && (
              <div className="mb5">
                <div className="tp-title-4 mb3">
                  <FormattedMessage id="from_the_business_heading" />
                </div>
                <div className="measure" style={{ whiteSpace: 'pre-line' }}>
                  {biz.fromTheBusiness}
                </div>
              </div>
            )}

            {/* From the editor */}

            {biz.fromTheEditor && (
              <div className="mb5">
                <div className="tp-title-4 mb3">
                  <FormattedMessage id="from_the_editor_heading" />
                </div>
                <div className="measure" style={{ whiteSpace: 'pre-line' }}>
                  {biz.fromTheEditor}
                </div>
              </div>
            )}

            {/* Reviews */}

            <div className="mb5">
              <div className="tp-title-4 mb3">
                <FormattedMessage id="reviews_title" />
              </div>
              <div className="measure mb5" style={{ whiteSpace: 'pre-line' }}>
                {reviews &&
                  reviews.length > 0 &&
                  reviews.map(review => (
                    <div key={review.id}>
                      <div className="flex items-center tp-body-3 black-300">
                        <StarRating rating={review.rating} />
                        <span className="ml2">
                          {review.created.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="tp-body-2 mt1 mb4">
                        <FormattedMessage
                          id="review_comment"
                          values={{
                            b: (...args) => <b>{args}</b>,
                            name: review.user.name,
                            comment: review.comment,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
              <ReviewForm biz={biz} location={props.location} />
            </div>

            {/* Survey details */}

            {details.length > 0 && (
              <>
                <div className="mt0 mb3 flex items-baseline justify-between">
                  <h3 className="tp-title-4">
                    <FormattedMessage id="business_survey_heading" />
                  </h3>
                  <div className="ml2 tp-body-2">
                    <TextButton
                      onClick={() => window.open(airtableForm)}
                      iconLeft={<ContentActionsEditSmall className="w1" />}
                      theme="inherit">
                      <FormattedMessage id="edit_action_label" />
                    </TextButton>
                  </div>
                </div>
                <ul className="tp-body-3 ph0">
                  {details.map(([key, values]) => (
                    <li key={key} className="bb b-gray-300 mb2">
                      <div className="flex justify-between items-end">
                        <div className="b mr4">
                          <FormattedMessage id={key} />
                        </div>
                        <div className="tr flex items-center">
                          <div className="mr1 mw6">
                            {values &&
                              values.map((value, index) => (
                                <React.Fragment key={`${key}-${index}`}>
                                  <div className={styles.detailsValue}>
                                    <FormattedMessage id={value} />
                                  </div>
                                </React.Fragment>
                              ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPage;
