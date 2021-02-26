import React, {Component} from 'react';
import NotFound from './404';
import PageHead from '../components/pageHead';
import {getOrigin, getSubdomain} from '../lib/utils';
import sdk, {Letter} from '@lettercms/sdk';

export default class Page extends Component {
  static async getInitialProps({req, query}) {
    const origin = getOrigin(req);
    const subdomain = getSubdomain(req);

    try {
      if (req) {
        const token = req.generateToken(subdomain);
        subSDK = new Letter(token);
      } else
        subSDK = sdk;

      let isSubscribe = false;

      const page = await subSDK.pages.single(query.url, [
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
  componentDidMount() {
    const links = document.getElementsByTagName('a');

    links.forEach(e => {
      e.onclick = (ev) => {
        if (e.target !== '_blank') {
          ev.preventDefault();
          Router.push(e.href);
        }
      }
    })
  }
  render({content, title, description, image, pathname}) {

    return <div>
      <PageHead title={title} description={description} image={image} url={pathname}/>
      <div dangerouslySetInnetHTML={{__html: content}}/>
    </div>
  }
}
