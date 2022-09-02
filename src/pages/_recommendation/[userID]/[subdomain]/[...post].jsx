import {getPost} from '@/lib/mongo/posts';
import Post from '@/components/post';

export async function getStaticProps({params: {subdomain, post, userID}}) {
  try {

    const res = await fetch(`https://${subdomain}.lettercms.vercel.app/api/blog/post?paths=${post.join(',')}&userID=${userID}`);
    const {blog, post, recommended, similar} = await res.json();

      if (blog.notFound)
        return {
          redirect: {
            permanent: true,
            destination: 'https://lettercms.vercel.app'
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
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
};
export default Post;
