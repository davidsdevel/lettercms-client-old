import dynamic from 'next/dynamic';
import {getPost, getMain} from '@/lib/page';
import {getPathType} from '@/lib/mongo/blogs';

const Post = dynamic(() => import('@/components/post'), {
  ssr: true
});
const Home = dynamic(() => import('@/components/index'), {
  ssr: true
});

export async function getServerSideProps({query: {subdomain, paths}}) {
  const pathType = await getPathType(subdomain, paths);

  if (pathType === 'main')
    return await getMain(subdomain);
  else if (pathType === 'post')
    return await getPost(subdomain, paths);
  else
    return {
      notFound: true
    };
}

export default function PageWraper(props) {
  if (props.pathType === 'main')
    return <Home {...props}/>;
  if (props.pathType === 'post')
    return <Post {...props}/>;
}