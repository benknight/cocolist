import _get from 'lodash/get';
import _uniqBy from 'lodash/uniqBy';
import React from 'react';
import { SocialFacebookSmall } from '@thumbtack/thumbprint-icons';
import messengerLogo from '../assets/messenger-logo.svg';
import vnmmLogo from '../assets/vnmm-logo.svg';
import { getLocalizedURL, getLocalizedVNMMURL } from '../lib/i18n';
import { getBadgesFromSurvey } from './Badges.common';

class BusinessRenderData {
  constructor(data, langKey) {
    this.data = data; // Airtable data
    this.langKey = langKey;
  }

  get id() {
    return this.data.Record_ID;
  }

  get url() {
    return getLocalizedURL(`/${this.data.URL_key}`, this.langKey);
  }

  get thumbnail() {
    return _get(this.data, 'Profile_photo.localFiles[0].childImageSharp.fluid');
  }

  get name() {
    return this.data.Name;
  }

  get survey() {
    return (this.data.Survey || [])
      .map(({ data }) => data)
      .find(({ Status }) => Status === 'Published');
  }

  get badges() {
    if (this.survey) {
      return getBadgesFromSurvey(this.survey);
    }
    return [];
  }

  get cities() {
    const cities = _uniqBy(
      this.neighborhoods.map(hood => hood.City[0].data),
      'Name',
    );
    return cities;
  }

  get neighborhoods() {
    let hoods = _uniqBy(
      this.data.Locations.map(({ data }) => data.Neighborhood[0].data),
      'Name',
    );
    if (hoods.length === 0) {
      hoods = this.data.Neighborhood.map(hood => hood.data);
    }
    return hoods;
  }

  get categories() {
    return this.data.Category.map(({ data }) => data.Name).reverse();
  }

  get photos() {
    return _get(this.survey, 'Attachments.localFiles', [])
      .map((photo, index) => ({
        fixed: photo.childImageSharp.fixed,
        raw: this.survey.Attachments.raw[index],
      }))
      .reverse();
  }

  // TODO: Refactor business page to use action buttons and remove this code.
  // Once JSX is gone this can be common and the logic can be reused on the Algolia queries
  get links() {
    const links = [];
    if (this.data.Facebook_link) {
      links.push([
        'Facebook_link',
        this.data.Facebook_link.split(',')[0].trim(),
        <SocialFacebookSmall />,
      ]);
      links.push([
        'Messenger_link',
        this.data.Facebook_link.split(',')[0]
          .trim()
          .replace('facebook.com', 'm.me'),
        <img alt="Messenger logo" className="w1 h1" src={messengerLogo} />,
      ]);
    }
    if (this.data.VNMM_link) {
      links.push([
        'VNMM_link',
        getLocalizedVNMMURL(this.data.VNMM_link.split(',')[0], this.langKey),
        <img alt="VietnamMM logo" className="w1 h1" src={vnmmLogo} />,
      ]);
    }
    return links;
  }

  get cocoPoints() {
    return this.data.Coco_points;
  }
}

export default BusinessRenderData;
