import dynamic from 'next/dynamic';
import {getPost, getMain} from '@/lib/page';
import {getPathType} from '@/lib/mongo/blogs';

const Post = dynamic(() => import('@/components/post'), {
  ssr: true
});
const Home = dynamic(() => import('@/components/index'), {
  ssr: true
});

export async function getStaticProps({req, query: {subdomain, paths}}) {
  const userID = req.cookies.userID;
  const pathType = await getPathType(subdomain, paths);
  if (pathType === 'no-blog')
    return {
      redirect: {
        permanent: true,
        destination: 'https://lettercms.vercel.app'
      }
    }

  let data = null
  
  if (pathType === 'main')
    data = await getMain(subdomain);
  if (pathType === 'post')
    data = await getPost(subdomain, paths);
  if (pathType === 'not-found')
    return {
      notFound: true
    };

  return {
    props: {
      ...data,
      userID
    },
    fallback: true
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
