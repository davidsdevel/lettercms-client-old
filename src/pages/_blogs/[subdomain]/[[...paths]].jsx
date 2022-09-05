import dynamic from 'next/dynamic';
import {getPathType, getBlog} from '@/lib/mongo/blogs';
import {getPost} from '@/lib/mongo/posts';

const Post = dynamic(() => import('@/components/post'), {
  ssr: true
});
const Home = dynamic(() => import('@/components/index'), {
  ssr: true
});

export function getStaticPaths() {
  return {
    paths: [],
    fallback:true
  }
}
export async function getStaticProps({params: {subdomain, paths}}) {
  const pathType = await getPathType(subdomain, paths);

  if (pathType === 'no-blog')
    return {
      redirect: {
        permanent: true,
        destination: 'https://lettercms.vercel.app'
      }
    }

  let props = null
  
  if (pathType === 'main')
    props = await getBlog(subdomain);
  if (pathType === 'post')
    props = await getPost(subdomain, post);
  if (pathType === 'not-found')
    return {
      notFound: true
    };

  return {
    props
  }
}

export default function PageWraper(props) { 
  let UI = null;

  if (props.pathType === 'main')
    UI = <Home {...props}/>;
  if (props.pathType === 'post')
    UI = <Post {...props}/>;

  return UI;
}
