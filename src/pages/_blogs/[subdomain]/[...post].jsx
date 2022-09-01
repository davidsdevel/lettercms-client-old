import {getPost, getUrls} from '@/lib/mongo/posts';
import Post from '@/components/post';

export async function getStaticProps({params: {subdomain, post}}) {
  try {
      const d = await getPost(subdomain, post);
      const {blog, post: _post, recommended, similar, accessToken} = d;
      
      if (blog.notFound)
        return {
          redirect: {
            permanent: true,
            destination: 'https://lettercms.vercel.app'
          }
        };

      if (_post?.notFound || !_post)
        return {
          notFound: true
        };

      return {
        props: {
          blog,
          post: _post,
          origin: '',
          recommended,
          similar,
          accessToken
        }
      };
    } catch (err) {
      throw err;
    }
}

export async function getStaticPaths() {
  return {
    paths = [],
    fallback: true,
  };
};

export default Post;
