simport Home from '@/components/index';
import {getRecommended} from '@/lib/mongo/blogs';

export async function getStaticProps({params: {userID, subdomain}}) {
  try {
      const {blog, posts, notFound} = await getRecommended(subdomain, userID);

      if (notFound)
        return {
          notFound: true
        };

      return {
        props: {
          blog,
          posts
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
