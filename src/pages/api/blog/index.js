import { withSentry } from '@sentry/nextjs';
import {getBlog} from '@/lib/mongo/blogs';

async function Blog(req, res) {
  if (req.method !== 'GET')
    return res.sendStatus(405);

  const {userID} = req.query;

  const hostname = req.headers.host || req.host;
  const subdomain = process.env.NODE_ENV === 'production'  ? hostname.replace('.lettercms.vercel.app', '') : hostname.replace('.localhost:3002', '');

  const d = await getBlog(subdomain, userID);

  res.json(d);
}

export default withSentry(Blog);