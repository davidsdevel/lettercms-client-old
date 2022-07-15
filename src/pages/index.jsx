import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import Link from 'next/link';
import Head from '../components/head';
import Landing from '../components/index/landing';
import Card from '../components/index/card';
import Banners from '../components/banners';
import dynamic from 'next/dynamic';
import {getOrigin, getSubdomain} from '../lib/utils';
import sdk from '@lettercms/sdk';
import store from '../store';
import {setBlogData} from '../store/actions';

const Pagination = dynamic(() => import('../components/index/pagination'));
const Recommended = dynamic(() => import('../components/index/recommended'));

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...props,
    };

    this.componentDidMount = this.componentDidMount.bind(this);
  }
  static async getInitialProps(ctx, {subdomain, token}) {

    const page = ctx.query.page || 1;
    const subSDK = token ? new sdk.Letter(token) : sdk;

    let isSubscribe = ctx.req ? ctx.req?.session?.isSubscribe : localStorage?.getItem('isSubscribe')
    let isOffline = false;

    let data;
    let blogData;

    try {
      blogData = await subSDK.blogs.single([
        'categories',
        'description',
        'title',
        'url'
      ]);

      const { data: posts, paging: {cursors: {before}}, /*recommended*/ } = await subSDK.posts.all({
        status: 'published',
        fields: [
          'description',
          'title',
          'images',
          'url',
          'fullUrl',
          'thumbnail',
          'comments',
          'category'
        ]
      });

      const parsedPosts = posts.map(e => {
        let _as = '';

        if (blogData.url === '1')
          _as = `/post?subdomain=${subdomain}&ID=${e.url}` 

        if (blogData.url === '2')
          _as = `/post?subdomain=${subdomain}&category=${e.category}&ID=${e.url}` 

        if (blogData.url === '3') {
          _as = `/post?subdomain=${subdomain}${e.fullUrl.replace('/', '&year=').replace('/', '&month=').replace('/', '&ID=')}` 
        }

        if (blogData.url === '4')
          _as = `/post?subdomain=${subdomain}${e.fullUrl.replace('/', '&year=').replace('/', '&month=').replace('/', '&day=').replace('/', '&ID=')}` 

        return {
          ...e,
          _as
        }
      })

      const recommended = parsedPosts[0];

      data = {
        posts: parsedPosts || [],
        before,
        recommended,
      };
    } catch (err) {
      throw err;
    } finally {

      return {
        ...data,
        isOffline,
        isSubscribe,
        blogData,
        page,
        subdomain
      };
    }
  }

  componentDidMount() {
    store.dispatch(setBlogData(this.props.blogData));

    if (process.env.NODE_ENV === 'development' || navigator.onLine)
      return;

    const page = this.props.page * 1;
    let next = this.props.next;

    let prev = false;/*

    const data = JSON.parse(localStorage.getItem('saved-posts'));

    if (data[page]) { next = true; }

    if (data[page > 1]) { prev = true; }*/

    this.setState({
      isOffline: true,/*
      prev,
      next,*/
      posts: data.slice(page - 10, page)
    });
  }

  render() {
    const {
      isOffline, page, blogData, isSubscribe, posts, before, prev, recommended,subdomain
    } = this.state;

    return (
      <div>
        <Head title={blogData.title} description={blogData.description} />
        <Landing isSubscribe={isSubscribe} description={blogData.description} />
        <h1>{blogData.title}</h1>
        {
          !isSubscribe
          && <h2>{blogData.description}</h2>
        }
        { posts.length > 0
          ? (<div id="main">
            {' '}
            {
              !isOffline && (
                <Recommended data={{...recommended, subdomain}}/>
              )
            }
            <div id="posts-container">
              <span style={{ marginLeft: '5%', display: 'block' }}>Entradas</span>
              {posts.map(({
                _id, description, title, images, url, fullUrl, comments, thumbnail, _as
                }, i) => (
                  <Card
                    key={`blog-index-${i}`}
                    title={title}
                    content={description}
                    url={`/${subdomain}${fullUrl}`}
                    thumbnail={thumbnail}
                    comments={comments}
                    ID={url}
                    as={_as}
                  />
                ))
              }
            </div>
          </div>
        )
        : (
          <div id="entries">
            <span>No Hay Entradas</span>
            <Banners length={posts.length} />
          </div>
        )}
        <div id="pagination-container">
          { (before || after) && 
            <Pagination before={before} after={after} actual={actual}/>
          }
        </div>
        <style jsx>
          {`
          h1 {
            margin: 50px 0 20px;
          }
          h1, h2 {
            text-align: center;
          }
          h2 {
            width: 90%;
            margin: auto;
          }
          :global(.banner-container) {
            margin 10px 0;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }
          #main {
            margin-top: 50px;
          }
          #pagination-container {
            position: relative;
            width: 80%;
            margin: 0 auto 100px;
            padding: 5px;
          }
          #entries {
            padding: 100px 0;
            width: 100%;
            text-align: center;
          }
          @media screen and (min-width: 720px) {
            :global(.banner-container) {
              margin: 0;
              margin-top: -25px;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              padding: 2%;
            }
            .banner-bottom {
              justify-content: center;
              width: 75%;
            }
            h2 {
              width: 60%;
            }
            #entries {
              display: inline-block;
              padding: 160px 0;
              text-align: center;
            }
            #posts-container {
              display: inline-block;
              width: 75%;
            }
            #pagination-container {
              width: 50%;
              margin: 0 0 0 10%;
              padding: 5px;
            }
          }
        `}
        </style>
      </div>
    );
  }
}

export default Home;
