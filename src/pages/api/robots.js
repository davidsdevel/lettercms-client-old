import {Letter} from '@lettercms/sdk';
import jwt from 'jsonwebtoken';
import {getSubdomain} from '@/lib/utils';
import { withSentry } from '@sentry/nextjs';

function Robots(req, res) {
  const hostname = req.headers.host;
  const subdomain = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1' ? hostname.replace('.lettercms-client.vercel.app', '') : hostname.replace('.localhost:3002', '');

  const token = jwt.sign({subdomain}, process.env.JWT_AUTH);
  const sdk = new Letter(token);

  const blog = sdk.blogs.single([
    'customDomain',
    'hasCustomRobots',
    'isVisible',
    'robots'
  ]);

  let robots;

  if (blog.hasCustomRobots)
    robots = blog.robots;
  else {
    if (blog.isVisible) {
      robots = `User-agent: *
        Disallow: /search
        Disallow: /feed
        Allow: /

        Sitemap: https://${blog.customDomain || `https://lettercms-client-davidsdevel.vercel.app/${subdomain}`}/sitemap.xml`;
    }
    else
      robots = `User-agent: *
        Disallow: *`;
  }
    
  res.send(robots.replace(/\n\s*/g, '\n'));
}

export default withSentry(Robots);
