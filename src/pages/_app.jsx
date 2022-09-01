import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import sdk from '@lettercms/sdk';
import Cookies from 'js-cookie';
import Facebook from '@/lib/client/FacebookSDK';
import Load from '@/components/loadBar';
import Nav from '@/components/nav';
import Footer from '@/components/index/footer';
import '@/styles/global.css';

const CustomApp = ({pageProps, Component}) => {
  const [showLoad, setLoad] = useState(false);
  const [tracingInit, setTracing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (pageProps.accessToken) {

      sdk.setAccessToken(pageProps.accessToken);
      
      setView();

      if (!pageProps.notFound && !tracingInit) {
        sdk.stats.startTrace();
        setTracing(true);
      }
    }
  }, [pageProps.accessToken]);

  function setView() {
    if (!pageProps.accessToken || router.preview || pageProps.notFound)
      return;

    try {
      const {post} = router.query;

      const url = post?.[post?.length - 1];

      sdk.stats.setView(url || '/', document.referrer);

    } catch (err) {
      throw err;
    }
  }

  useEffect(() => {
    /*const UID = Cookies.get('userID');
    if (!UID) {
      sdk.createRequest('/user','POST', {
        device: /Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
      }).then(({id}) => {
        Cookies.set('userID', id);
      });
    }*/

    const html = document.getElementsByTagName('html')[0];

    router.events.on('routeChangeStart', () => {
      html.style.scrollBehavior = '';

      setLoad(true);
    });

    router.events.on('routeChangeComplete', () => {
      window.scrollTo(0, 0);
      html.style.scrollBehavior = 'smooth';

      setLoad(false);
    });
  }, []);

  if (router.isFallback)
    return <div>Loading</div>;
  
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
    <Footer title={pageProps.blog?.title}/>
  </div>;
};

export default CustomApp;
