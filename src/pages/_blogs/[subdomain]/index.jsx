import Home from '@/components/index';
import {getBlog, getSubdomains} from '@/lib/mongo/blogs';

export async function getStaticProps({params: {subdomain}}) {
  try {
      const {blog, posts, notFound, accessToken} = await getBlog(subdomain);

      if (notFound)
        return {
          redirect: {
            permanent: true,
            destination: 'https://lettercms.vercel.app'
          }
        };

      return {
        props: {
          blog,
          posts,
          accessToken
        }
      };
    } catch (err) {
      throw err;
    }
}
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
};

export default Home;
