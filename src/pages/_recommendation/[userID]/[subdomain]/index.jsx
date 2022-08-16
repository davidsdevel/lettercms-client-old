import Home from '@/components/index';
import {getRecommended} from '@/lib/mongo/blogs';

export async function getStaticProps({params: {userID}}) {
  try {
      const {blog, posts, notFound} = await getRecommended(userID);

      if (notFound)
        return {
          redirect: {
            permanent: true,
            destination: process.env.DASHBOARD_DOMAIN
          }
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

export default Home;
