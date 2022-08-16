import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import * as Sentry from '@sentry/browser';
import { RewriteFrames } from '@sentry/integrations';
import _sdk from '@lettercms/sdk';
import Cookies from 'js-cookie';
import Facebook from '../lib/client/FacebookSDK';
import Load from'../components/loadBar';
import Nav from '../components/nav';
import Footer from '../components/index/footer';
import '@/styles/global.css';

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

const CustomApp = ({pageProps, Component}) => {
  const [showLoad, setLoad] = useState(false);
  const router = useRouter();
  const sdk = new _sdk.Letter(pageProps.accessToken);

  function setView() {
    try {
      const {post} = router.query;

      sdk.stats.setView('/', document.referrer);
    } catch (err) {
      throw err;
    }
  }

  useEffect(() => {
    console.log(pageProps);

    if (!router.query.userID) {
      sdk.createRequest('/user','POST', {
        device: /Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
      }).then(({id}) => {
        Cookies.set('userID', id);
      });

    }

    setView();
    sdk.stats.startTrace();
    
    const html = document.getElementsByTagName('html')[0];

    router.events.on('routeChangeStart', () => {
      html.style.scrollBehavior = '';

      setLoad(true);
    });
    router.events.on('routeChangeComplete', () => {
      setView();

      window.scrollTo(0, 0);
      html.style.scrollBehavior = 'smooth';

      setLoad(false);
    });

  }, []);
  return <div>
    <Head>
      {
        pageProps?.next
        && <link rel="next" />
      }
      {
        pageProps?.prev
        && <link rel="prev" />
      }
    </Head>
    {
      showLoad
      && <Load />
    }
    <Nav subdomain={router.query.subdomain}/>
    <Component {...pageProps} />
    <Footer title={pageProps.blogTitle || pageProps.blogData?.title}/>
  </div>
}

export default CustomApp;
