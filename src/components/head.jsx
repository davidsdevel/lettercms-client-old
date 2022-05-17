import React from 'react';
import NextHead from './_headBase';
import { string } from 'prop-types';

const Head = (props) => {

  const defaultDescription = 'Just another site created with love with LetterCMS';
  const defaultOGURL = props.origin;
  const defaultOGImage = props.origin + '/images/og.jpg';

  return <NextHead {...props}>
    <meta href={props.ogImage || defaultOGImage} content={props.ogImage || defaultOGImage} property='og:image' name='twitter:image' itemProp='image' rel="image_src"/>
  </NextHead>;
}

Head.propTypes = {
  title: string,
  description: string,
  url: string,
  ogImage: string,
  origin: string,
};

export default Head;
