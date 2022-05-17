import React, {Component} from 'react';
import NotFound from './404';
import PageHead from '../components/pageHead';
import {getOrigin, getSubdomain} from '../lib/utils';
import sdk from '@lettercms/sdk';
import Router from 'next/router';

export default class Page extends Component {
  static async getInitialProps({req, query, asPath}) {
    const origin = getOrigin(req);
    const subdomain = getSubdomain(req);

    let subSDK;

    try {
      if (req) {
        const token = req.generateToken(subdomain);
        subSDK = new sdk.Letter(token);
      } else
        subSDK = sdk;

      let isSubscribe = false;

      const page = await subSDK.pages.single(query.ID, [
        'images',
        'html',
        'css',
        'title',
        'description'
      ]);

      query = Object.assign({}, query, page);

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

    for (let e of links) {
      e.onclick = ev => {
        if (e.attributes.target !== '_blank') {
          ev.preventDefault();
          Router.push(e.attributes.href);
        }
      }
    }
  }
  render({html, css, title, description, image, pathname}) {
    return <div>
      <PageHead title={title} description={description} image={image} url={pathname}/>
      <style>{css}</style>
      <div dangerouslySetInnerHTML={{__html: html}}/>
    </div>
  }
}
