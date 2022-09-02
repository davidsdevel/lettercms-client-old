import { withSentry } from '@sentry/nextjs';

async function Post(req, res) {
  if (req.method !== 'GET')
    return res.sendStatus(405);

  res.json({hola: 'mundo'});
}

export default withSentry(Post)