import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import Router from 'next/router';
import { string } from 'prop-types';
import Head from '../components/head';
import Card from '../components/index/card';
import Banners from '../components/banners';
import dynamic from 'next/dynamic';
import {getOrigin} from '../lib/utils';

const SetBanner = dynamic(() => import('../lib/banners'), {
  ssr: false
});

class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      posts: props.posts,
      page: 1,
    };
    this.viewMore = this.viewMore.bind(this);
  }

  static async getInitialProps({
    req, res, asPath, query,
  }) {
    const { q } = query;
    const origin = getOrigin(req);

    if (q) {
      const searchReq = await fetch(`${origin}/api/posts/search?q=${q}&page=1&fields=description,title,image,url,comments,category`);

      const data = await searchReq.json();

      return {
        ...data,
        search: q,
        pathname: asPath,
      };
    }
    if (!req) { Router.push('/'); }
    else { res.redirect(301, '/'); }
  }

  async viewMore() {
    try {
      const { search } = this.props;
      const { page, posts } = this.state;

      const req = await fetch(`/api/posts/search?q=${search}&page=${page + 1}&fields=description,title,image,url,comments,category`);
      const data = await req.json();

      this.setState({
        posts: Object.assign([], posts, data.posts),
        next: data.next,
        page: page + 1,
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  render({ search, pathname }, { posts, next }) {

    return (
      <div>
        <Head title="David's Devel" url={pathname} />
        <span id="title">
          Busquedas para el termino:
          <b>{decodeURI(search)}</b>
        </span>
        <div className="banner-container">
          {setBanner()}
        </div>
        <div id="posts-container">
          <span style={{ marginLeft: '5%', display: 'block' }}>Entradas</span>
          {	posts.length > 0

            ? posts.map(({
              description, title, image, url, comments, category,
            }) => (
              <Card
                key={url}
                title={title}
                content={description}
                url={url}
                image={image}
                comments={comments}
                category={category}
              />
            ))
					  : (
            <div>
              <span>
                No hay entradas con el termino:
                <b>{search}</b>
              </span>
            </div>
					  )}
        </div>
        <Banners length={posts.length}/>
        {
					!!next
					&& <button onClick={this.viewMore}>Ver Más</button>
				}
        <div className="banner-container">
          <SetBanner/>
        </div>
        <style jsx>
          {`
					#title {
						margin: 100px 0 20px;
						text-align: center;
						display: block;
						font-size: 28px;
					}
					.banner-container {
						margin 50px 0;
						display: flex;
						justify-content: center;
						align-items: center;
					}
					@media screen and (min-width: 720px) {
						h2 {
							width: 60%;
						}
						#posts-container {
							display: inline-block;
							width: 75%;
						}
					}
				`}
        </style>
      </div>
    );
  }
}

Search.propTypes = {
  search: string,
  pathname: string,
};

export default Search;
