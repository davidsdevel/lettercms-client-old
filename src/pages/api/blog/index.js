import { withSentry } from '@sentry/nextjs';

async function Post(req, res) {
  if (req.method !== 'GET')
    return res.sendStatus(405);

  res.json({headers: req.headers, cookies: req.cookies, host: req.host});
}

export default withSentry(Post);