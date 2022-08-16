import {getPost} from '@/lib/mongo/posts';
import Post from '@/components/post';

export async function getStaticProps({params: {subdomain, post, userID}}) {
  try {
      const {blog, post, recommended, similar} = await getPost(subdomain, post, userID);

      if (blog.notFound)
        return {
          redirect: {
            permanent: true,
            destination: process.env.DASHBOARD_DOMAIN
          }
        };

      if (post.notFound)
        return {
          notFound: true
        };

      return {
        props: {
          blog,
          post,
          origin: '',
          recommended,
          similar
        }
      };
    } catch (err) {
      throw err;
    }
}

export default Post;
