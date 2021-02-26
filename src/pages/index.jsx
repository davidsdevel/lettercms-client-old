import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import Link from 'next/link';
import Head from '../components/head';
import Landing from '../components/index/landing';
import Card from '../components/index/card';
import Banners from '../components/banners';
import dynamic from 'next/dynamic';
import {getOrigin, getSubdomain} from '../lib/utils';
import sdk, {Letter} from '@lettercms/sdk';
import store from '../store';
import {setBlogData} from '../store/actions';

const Pagination = dynamic(() => import('../components/index/pagination'));
const SetBanner = dynamic(() => import('../lib/banners'), {
  ssr: false
});
const Recommended = dynamic(() => import('../components/index/recommended'));

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...props,
    };

    this.componentDidMount = this.componentDidMount.bind(this);
  }
  static async getInitialProps({ req, query, res }) {
    const page = query.page || 1;
    const subdomain = 'davidsdevel'//getSubdomain(req);

    let isSubscribe = false;
    let isOffline = false;

    let data;
    let blogData;
    let subSDK;

    if (req) {
      const token = req.generateToken(subdomain);
      subSDK = new Letter(token);
      
      isSubscribe = req.session.isSubscribe;
    } else {
      isSubscribe = localStorage.getItem('isSubscribe');
      subSDK = sdk;
    }


    try {
      blogData = await subSDK.blogs.single([
        'categories',
        'description',
        'title',
        'url'
      ]);

      store.dispatch(setBlogData(blogData));

      const { data: posts, next, /*recommended*/ } = await subSDK.posts.all({
        status: 'published',
        fields: [
          'description',
          'title',
          'images',
          'url',
          'thumbnail',
          'comments',
          'category'
        ]
      });

      const recommended = posts[0];

      data = {
        posts: posts || [],
        next,
        recommended,
      };
    } catch (err) {
      throw new Error(err);
      if (err.toString() === 'TypeError: Failed to fetch') {
        isOffline = true;
      }
    } finally {

      return {
        ...data,
        isOffline,
        isSubscribe,
        blogData,
        page,
      };
    }
  }

  componentDidMount() {
    if (process.env.NODE_ENV === 'development' || navigator.onLine)
      return;

    const page = this.props.page * 1;
    const next = this.props.next;

    let prev = false;

    const data = JSON.parse(localStorage.getItem('saved-posts'));

    if (data[page]) { next = true; }

    if (data[page > 1]) { prev = true; }

    this.setState({
      isOffline: true,
      prev,
      next,
      posts: data.slice(page - 10, page),
    });
  }

  render(_, {
    isOffline, page, blogData, isSubscribe, posts, next, prev, recommended,
  }) {

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
                <Recommended data={recommended}/>
              )
            }
            <div id="posts-container">
              <span style={{ marginLeft: '5%', display: 'block' }}>Entradas</span>
              {posts.map(({
                _id, description, title, images, url, comments, thumbnail
                }, i) => (
                  <Card
                    key={`blog-index-${i}`}
                    title={title}
                    content={description}
                    url={url}
                    thumbnail={thumbnail}
                    image={images}
                    comments={comments}
                    ID={_id}
                  />
                ))
              }
            </div>
            <Banners length={posts.length} />
          </div>
        )
        : (
          <div id="entries">
            <span>No Hay Entradas</span>
            <Banners length={posts.length} />
          </div>
        )}
        <div id="pagination-container">
          { (prev || next) && 
            <Pagination next={next} prev={prev} page={page}/>
          }
        </div>
        <div className="banner-container banner-bottom">
          <SetBanner/>
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
