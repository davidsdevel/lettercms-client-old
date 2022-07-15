import App from 'next/app';
import Router from 'next/router';
import Head from 'next/head';
import dynamic from "next/dynamic";
import Facebook from '../lib/client/FacebookSDK';
import Alert from '../components/alert';
import store from '../store';
import { showAlert } from '../store/actions';
import * as Sentry from '@sentry/browser';
import { RewriteFrames } from '@sentry/integrations';
import {getSubdomain, redirect, getOrigin, generateToken} from '../lib/utils';
import sdk from '@lettercms/sdk';
import Cookies from 'js-cookie';
import {parse as cookieParser} from 'cookie';
import NotFound from './404';

const isDev = process.env.NODE_ENV !== 'production';

Sentry.init({
  enabled: !isDev,
  dsn: process.env.SENTRY_DSN,
  maxBreadcrumbs: 50,
  debug: isDev,
  environment: 'client',
  release: process.env.RELEASE,
  integrations: [
    new RewriteFrames({
      iteratee: (frame) => {
        const splitted = frame.filename.split('.next');

        frame.filename = frame.filename.replace(splitted[0], 'app:///_next');

        return frame;
      },
    }),
  ],
});

//Dynamics
const Load = dynamic(() => import('../components/loadBar'), {ssr: false });
const Nav = dynamic(() => import('../components/nav'));
const Footer = dynamic(() => import('../components/index/footer'));

export default class CustomApp extends App {
  constructor() {
    super();

    this.state = {
      showLoad: false,
    };
  }

  static async getInitialProps({Component, ctx}) {
    if (ctx.asPath === '/')
      return {
        status: 404
      };

    const {subdomain} = ctx.query;//getSubdomain(ctx.req);
    console.log(subdomain)

    const existsSubdomain = await sdk.Letter.existsSubdomain(subdomain);
    
    if (!existsSubdomain)
      return redirect(ctx.req, ctx.res, 'https://lettercms-dashboard-davisdevel.vercel.app');

    const token = generateToken(subdomain);
    console.log(token)
    const origin = getOrigin(ctx.req);
    const isSubscribe = ctx.req?.cookies.isSubscribe || false;
    const referrer = ctx.req?.headers.referrer || null;
    const {userID} = cookieParser(ctx.req?.headers.cookie || '');


    let pageProps = {};

    if (Component.getInitialProps)
      pageProps = await Component.getInitialProps(ctx, {
        subdomain,
        token,
        origin
      });

    if (Component.name === 'ErrorPage')
      pageProps.hideLayout = true;

    return {
      pageProps,
      referrer,
      viewUrl: ctx.asPath,
      isSubscribe,
      subdomain,
      token,
      userID
    };
  }

  async setView() {
    if (this.props.pageProps.hideLayout || this.props.viewUrl === '/')
      return;

    try {
      const { viewUrl, fererrer } = this.props;

      if (this.props.viewUrl !== '/') {
        const splitted = viewUrl.split('/');

        const url =  /(vercel\.app|:3002)\/\w*(\?|$)/.test(window.location.href) ? '/' : splitted[splitted.length - 1];

        await sdk.stats.setView(url, fererrer);
      }
    } catch (err) {
      throw err;
    }
  }

  async componentDidMount() {
    if (this.props.status === 404)
      return;

    sdk.setAccessToken(this.props.token);

    if (!this.props.userID) {
      const {id} = await sdk.createRequest('/user','POST', {
        device: /Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
      });

      Cookies.set('userID', id);
    }

    this.setView();
    sdk.stats.startTrace();

    window.alert = msg => store.dispatch(showAlert(msg));

    const html = document.getElementsByTagName('html')[0];

    Router.events.on('routeChangeStart', () => {
      html.style.scrollBehavior = '';

      this.setState({
        showLoad: true,
      });
    });

    Router.events.on('routeChangeComplete', () => {
      this.setView();

      window.scrollTo(0, 0);
      html.style.scrollBehavior = 'smooth';

      this.setState({
        showLoad: false,
      });
    });
  }

  render() {
    const {Component, pageProps, isSubscribe, viewUrl, status} = this.props;
    const {showLoad} = this.state;

    if (status === 404)
      return <NotFound/>;

    return (
      <div>
        <Head>
          {
            pageProps?.next &&
            <link rel="next" />
          }
          {
            pageProps?.prev
            && <link rel="prev" />
          }
        </Head>
        {
          (showLoad && !pageProps?.hideLayout)
          && <Load />
        }
        {
          !pageProps?.hideLayout
          && (
            <div>
              <Nav />
            </div>
          )
        }
        <Component {...pageProps} />
        {
          !pageProps?.hideLayout
          && <Footer/>
        }
        <Alert />
        <style jsx global>
          {`
                input[type=checkbox],
                input[type=radio] {
                    display: none;
                }
                input[type=checkbox]:checked + label.option::before,
                input[type=radio]:checked + label.option::before {
                    width: 15px;
                    height: 15px;
                    border: 5px solid #f0f0f0;
                    background: #555;
                }
                label.option {
                    display: flex;
                    align-items: center;
                    position: relative;
                    background: white;
                    padding: 8px 16px;
                    box-shadow: 1px 1px 5px rgba(0,0,0,.3);
                    margin: 5px 0;
                    border-radius: 5px;
                    max-width: 400px;
                    cursor: pointer;

                    transition: ease .3s;
                }
                label.option:hover {
                    background: #f0f0f0;
                }
                label.option::before {
                    content: "";
                    width: 25px;
                    height: 25px;
                    margin: 0 16px 0 0;
                    background: rgb(243, 245, 247);
                    border-radius: 5px;
                    display: inline-block;
                }
                button:focus {
                    outline: none;
                }
                li {
                    list-style: none;
                }
                a {
                    text-decoration: none;
                }
                * {
                    margin: 0;
                    padding: 0;
                    font-family: Roboto, Helvetica;
                }
                hr {
                    border: .5px rgba(0,0,0,.1) solid;
                }
                .title {
                    font-size: 26px;
                    font-weight: bold;
                    text-align: center;
                    display: block;
                    margin: 15px 0;
                }
                .sub-title {
                    font-size: 20px;
                    font-weight: bold;
                }
                input:focus {
                    outline: none;
                }
                input[type="text"],
                input[type="password"],
                input[type="email"],
                textarea,
                button.gray,
                button.black,
                button.white,
                button.circle
                {
                    background: white;
                    padding: 10px 20px;
                    border: none;
                    box-shadow: rgba(0,0,0,.3) 1px 1px 2px;
                    border-radius: 10px;
                }
                input[type="text"].search {
                    padding: 0;
                    box-shadow: none;
                }
                button {
                    cursor: pointer;
                    transition: ease .3s;
                    border-radius: 5px;
                }
                button:disabled {
                  filter: brightness(.3);
                }
                button.white:hover, button.black {
                    background: #1d1d1d;
                    color: white;
                }
                button.gray {
                    background: #7f7f7f;
                    color: white;
                }
                button.black:hover, button.gray:hover, button.white {
                    background: white;
                    color: black;
                }
                button.circle {
                    padding: 20px;
                    border-radius: 50%;
                }
                button:disabled {
                    background: black;
                    color: gray;
                    box-shadow: none;
                    cursor: default;
                }
                button:disabled:hover {
                    background: black;
                    color: gray;
                }
                @keyframes rotation {
                    0% {
                        transform: rotate(0deg);
                    } 100% {
                        transform: rotate(359deg);
                    }
                }
                aside.banners {
                    display: none;
                }
                @media screen and (min-width: 780px) {
                    aside.banners {
                        float: right;
                        margin-right: 5%;
                        display: flex;
                        justify-content: center;
                        flex-direction: column;
                        margin-top: 50px;
                    }
                    aside.banners a {
                        display: block;
                    }
                }
            `}
        </style>
      </div>
    );
  }
}
