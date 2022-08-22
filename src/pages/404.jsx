import Head from 'next/head';
import Link from 'next/link';

const NotFound = () => (
  <div>
    <Head>
      <meta charSet="utf-8" />
      <title>Ups. Lo sentimos</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div id="container">
      <img alt='' src="https://cdn.jsdelivr.net/gh/davidsdevel/lettercms-cdn/public/assets/404.svg" />
      <div>
        <p>Ups. No hay nada por aqui</p>
        <span>
          ¿Te perdiste? Bueno dejame llevarte hasta el
          <Link href="/"><a> Inicio</a></Link>
        </span>
      </div>
    </div>
    <style jsx>
      {`
    #container {
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
    #container img {
      width: 150px;
    }
  `}
    </style>
  </div>
);

export default NotFound;
