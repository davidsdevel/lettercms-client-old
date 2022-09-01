import * as Sentry from '@sentry/nextjs';
import NextErrorComponent from 'next/error';
import Head from 'next/head';
import Link from 'next/link';

const CustomErrorComponent = props => {
  Sentry.captureUnderscoreErrorException(props);

  return <div>
    <Head>
      <meta charSet="utf-8" />
      <title>Ups. Lo sentimos</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div id="container">
      <img layout='fill' alt='' src="https://cdn.jsdelivr.net/gh/davidsdevel/lettercms-cdn/public/assets/error.svg" />
      <div>
        <p>Parece que estamos teniendo problemas</p>
        <p>Por suerte nuestro equipo ya esta informado.</p>
        <span>
          <Link href="/"><a> Inicio</a></Link>
        </span>
      </div>
    </div>
    <style jsx>{`
      #container {
        padding: 1rem 0;
        text-align: center;
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        background: #f7f7f7;
      }
    `}</style>
  </div>;
};

CustomErrorComponent.getInitialProps = async contextData => {
  const errorInitialProps = await NextErrorComponent.getInitialProps(contextData);

  errorInitialProps.hasGetInitialPropsRun = true;

  if (contextData.err) {
    Sentry.captureException(contextData.err);

    await Sentry.flush(2000);

    return errorInitialProps;
  }

  Sentry.captureException(
    new Error(`_error.js getInitialProps missing data at path: ${contextData.asPath}`)
  );
  await Sentry.flush(2000);

  return errorInitialProps;
};

export default CustomErrorComponent;
