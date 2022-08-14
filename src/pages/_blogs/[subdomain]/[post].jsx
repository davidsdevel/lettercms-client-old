import Link from 'next/link';
import fetch from 'isomorphic-fetch';
import Head from '../components/postHead';
import Share from '../components/post/share';
import About from '../components/post/about';
import dynamic from 'next/dynamic';
import HandleDate from '../lib/handleDate';
import Banners from '../components/banners';
import {getOrigin, getSubdomain} from '../lib/utils';
import sdk from '@lettercms/sdk';
import {getPost} from '@/lib/mongo/posts';


const ErrorPage = dynamic(() => import('./404'))
const SetBanner = dynamic(() => import('../lib/banners'), {
  ssr: false
});

export async function getStaticProps({params: {subdomain, post}}) {
  try {
      const {blog, post} = await getPost(subdomain, post);

      if (blog.notFound)
        return {
          redirect: {
            permanent: true,
            destination: process.env.DASHBOARD_DOMAIN
          }
        }

      if (post.notFound)
        return {
          notFound: true
        }

      return {
        props: {
          blog,
          post,
          origin: ''
        }
      }
    } catch (err) {
      throw err;
    }
}

class Post extends Component {
  async componentDidMount() {
    let lazyImages = [].slice.call(document.querySelectorAll('img.lazy-img'));
    let active = false;

    const lazyLoad = () => {
      if (active === false) {
        active = true;

        setTimeout(() => {
          lazyImages.forEach((lazyImage) => {
            if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== 'none') {
              lazyImage.src = lazyImage.dataset.src;

              lazyImage.onload = () => {
                lazyImage.classList.remove('lazy-img');
              };

              lazyImages = lazyImages.filter((image) => image !== lazyImage);

              if (lazyImages.length === 0) {
                document.removeEventListener('scroll', lazyLoad);
                window.removeEventListener('resize', lazyLoad);
                window.removeEventListener('orientationchange', lazyLoad);
              }
            }
          });
          active = false;
        }, 200);
      }
    };

    document.addEventListener('scroll', lazyLoad);
    window.addEventListener('resize', lazyLoad);
    window.addEventListener('orientationchange', lazyLoad);

    const script = document.createElement('script');

    script.src = 'https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js?skin=sunburst';

    document.body.appendChild(script);
  }

  render() {
    const {
      post: {
        images,
        content,
        title,
        tags,
        updated,
        published,
        description,
        category,
        author,
        thumbnail
        url,
      },
      status,
      isSubscribe = false,
      origin,
      blog,
    } = this.props;

    return (
      <div>
        <Head url={url} category={category} published={updated} title={`${title} | ${blog.title}`} tags={tags} images={images} description={description} />
        <header>
          <div id="header-shadow">
            <h1>{title}</h1>
          </div>
          <img src="/images/davidsdevel-rombo.png" />
        </header>
        <div>
          <div>
            <span className="publish-date">{HandleDate.getGMTDate(published)}</span>
          </div>
          <main dangerouslySetInnerHTML={{ __html: content }} />
        </div>
        <ul id="tags">
          {tags.map((e) => (
            <li key={`tag-${e}`}>
              <Link href={`/search?q=${e}`}>
                <a>{e}</a>
              </Link>
            </li>
          ))}
        </ul>
        <Share url={url} title={title} isSubscribe={isSubscribe} />
        <About {...author}/>
        <h4>Comentarios</h4>
        <div
          id="comments-container"
          dangerouslySetInnerHTML={{
            __html: `<div
       class="fb-comments"
       data-href=${origin}?url=${url}
       data-width="100%"
       data-numposts="20"
      ></div>`
          }}
        />
        <style jsx>
          {`
        header {
          background-image: url(${thumbnail || images?.[0] || '/images/privacidad.jpg'});
          height: 600px;
          width: 100%;
          background-position: center;
          background-size: cover;
          overflow: hidden;
        }
        header img {
          position: absolute;
          width: 30%;
          top: 100px;
          left: 35%;
        }
        h1 {
          color: white;
          width: 90%;
          margin: 300px auto 0;
          text-align: center;
        }
        header #header-shadow {
          overflow: hidden;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, .5)
        }
        .publish-date {
          margin:  2rem 5% 0;
          display: block;
          font-weight: bold;
          font-size: 16px;
          color: rgb(80, 80, 80)
        }
        main {
          padding: 0 5%;
          margin: 2rem 0;
        }
        #tags {
          margin: 0 0 20px;
          padding: 0 0 0 5%;
        }
        #tags li {
          font-size: 12px;
          margin: 5px 0;
        }
        .banner-container {
          margin 50px 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        #comments-container {
          width: 90%;
          margin: auto;
        }
        @media screen and (min-width: 720px) {
          main {
            width: 60%;
            display: inline-block;
          }
          header img {
            position: absolute;
            width: 20%;
            top: 100px;
            left: 40%;
          }
          #comments-container {
            width: 60%;
          }
        }
        @media screen and (min-width: 960px) {
          header img {
            width: 10%;
            top: 200px;
            left: 45%;
          }
          h1 {
            background: linear-gradient(90deg, black, transparent);
            margin: 400px 0 0;
            padding: 20px;
            text-align: initial;
          }
        }
      `}
        </style>
        <style global jsx>
          {`
        h1, h2, h3, h4 {
          text-align: center;
          margin: 30px 0 50px;
        }
        b {
          color: black;
        }
        main p {
          text-align: justify;
        }
        main img {
          max-width: calc(100%);
          height: auto;
        }
        main img.lazy {
          filter: blur(8px)
        }
        main ul {
          padding: 0 0 0 20px;
          margin: 10px 0;
        }
        main ul li {
          margin: 5px 0;
          list-style: initial;
        }
        blockquote {
          font-style: italic;
          color: gray;
          font-size: 18px;
          margin: 15px auto;
          border-left: 5px gray solid;
          padding-left: 15px;
        }
        @media screen and (min-width: 780px) {
          main p {
            text-align: left;
          }
        }
      `}
        </style>
      </div>
    );
  }
}
export default Post;
