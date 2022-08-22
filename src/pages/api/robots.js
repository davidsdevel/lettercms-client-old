import {Letter} from '@lettercms/sdk';
import jwt from 'jsonwebtoken';
import {getSubdomain} from '@/lib/utils';

export default function Robots(req, res) {
  const {subdomain} = req.query;

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
