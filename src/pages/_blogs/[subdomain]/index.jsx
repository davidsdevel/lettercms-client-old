import Home from '@/components/index';
import {getBlog} from '@/lib/mongo/blogs';

export async function getStaticProps({params: {subdomain}}) {
  try {
      const {blog, posts, notFound} = await getBlog(subdomain);

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
