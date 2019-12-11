import React from 'react';
import Helmet from 'react-helmet';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Wrap } from '@thumbtack/thumbprint-react';
import OPGPreviewImage from '../assets/og-preview.jpg';
import CitySelector from '../components/CitySelector';
import Header from '../components/Header';
import { getLocalizedURL } from '../lib/common/i18n';

const metaDescription = `Find restaurants in Vietnam with plastic-free delivery, discounts for customers who bring their own containers, or free drinking water.`;

const Index = ({ intl: { formatMessage }, location, pageContext: { langKey } }) => {
  const pageTitle = formatMessage(
    {
      id: 'find_businesses_headline',
    },
    { city: formatMessage({ id: 'Vietnam' }) },
  );
  return (
    <>
      <Helmet>
        <title>Cocolist &ndash; {pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="fb:app_id" content="375503033345734" />
        <meta property="og:title" content={`Cocolist – ${pageTitle}`} />
        <meta property="og:image" content={`https://cocolist.vn${OPGPreviewImage}`} />
        <meta
          property="og:url"
          content={`https://cocolist.vn${getLocalizedURL('/', langKey)}`}
        />
        <meta property="og:description" content={metaDescription} />
        <meta property="twitter:card" content={`https://cocolist.vn${OPGPreviewImage}`} />
      </Helmet>
      <Header location={location} showSearch={false} />
      <Wrap>
        <div className="mv4 m_mv5">
          <div className="tp-title-2 tc">
            <FormattedMessage id="select_city_label" />
          </div>
          <CitySelector location={location} variant="grid" />
        </div>
      </Wrap>
    </>
  );
};

export default injectIntl(Index);
