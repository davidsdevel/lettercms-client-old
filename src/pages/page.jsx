import React, {Component} from 'react';
import NotFound from './404';
import PageHead from '../components/pageHead';
import {getOrigin, getSubdomain} from '../lib/utils';
import sdk from 'LetterCMS';

export default class Page extends Component {
  static async getInitialProps({req, query}) {
    const origin = getOrigin(req);
    const subdomain = getSubdomain(req);

    try {
      let isSubscribe = false;

      const page = await sdk.useSubdomain(subdomain).pages.single(query.url, [
        'images',
        'content',
        'title',
        'description'
      ]);

      query = Object.assign('/', query, pageData.page);

      return {
        ...query,
        pathname: asPath,
        hideLayout: true
      };
    } catch (err) {
      throw new Error(err);
    }
	}
  render({content, title, description, image, pathname}) {

    return <div>
      <PageHead title={title} description={description} image={image} url={pathname}/>
      <div dangerouslySetInnetHTML={{__html: content}}/>
    </div>
  }
}
