import React, { Component } from 'react';
import Head from 'next/head';
import Link from 'next/link';

class ErrorPage extends Component {
  static async getInitialProps({ req, res }) {
    return {
      hideLayout: true
    }
  }
  render() {
    return <div>
        <Head>
          <meta charSet="utf-8" />
          <title>Ups. Lo sentimos</title>
          <meta name="viewport" content="with=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div id="container">
          <span id="status">500</span>
          <div>
            ¡Lo sentimos!
            <br />
            Hubo un error en el servidor
            <br />
            <Link href="/"><a>Inicio</a></Link>
          </div>
        </div>
        <style jsx>
          {`
					#container {
						text-align: center;
					}
					#container #status {
						font-size: 50px;
						display: block;
						margin: 100px auto;
						font-weight: bold;
					}
				`}
        </style>
      </div>
  }
}

export default ErrorPage;
