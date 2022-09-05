import Head from 'next/head';
import Image from 'next/image';

export default function Fallback() {
  return <div id='fallback'>
    <Head>
      <meta charSet="utf-8" />
      <title>Cargando...</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <span>Cargando</span>
    <style jsx>{`
      #fallback {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f3f7fd;
      }
    `}</style>
  </div>
}