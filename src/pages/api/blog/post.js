import { withSentry } from '@sentry/nextjs';
import {getPost} from '@/lib/mongo/posts';

async function Post(req, res) {
  if (req.method !== 'GET')
    return res.sendStatus(405);

  const {paths, userID} = req.query;

  const hostname = req.headers.host;
  const subdomain = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1' ? hostname.replace('.lettercms-client.vercel.app', '') : hostname.replace('.localhost:3002', '');

  const post = paths.split(',');

  const d = await getPost(subdomain, post, userID);

  res.json(d);
}

export default withSentry(Post)