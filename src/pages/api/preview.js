import _sdk from '@lettercms/sdk';
import connect from '@/lib/mongo/';
import modelFactory from '@lettercms/models';
import { withSentry } from '@sentry/nextjs';


async function Preview(req, res) {
  const {id} = req.query;
  
  const hostname = req.headers.host;

  const subdomain = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1' ? hostname.replace('.lettercms-client.vercel.app', '') : hostname.replace('.localhost:3002', '');
  
  if (!id || !subdomain) {
    return res.status(401).json({ message: 'Invalid ID' });
  }

  const mongo = await connect();
    
  const {posts} = modelFactory(mongo, ['posts']);

  const existsPost = await posts.exists({_id: id});

  if (!existsPost) {
    return res.status(401).json({ message: 'Invalid slug' });
  }

  res.setPreviewData({}, {
     maxAge: 60
  });

  res.redirect(`/${req.query.id}`);
}

export default withSentry(Preview);
