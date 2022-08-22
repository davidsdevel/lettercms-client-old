import {Letter} from '@lettercms/sdk';
import jwt from 'jsonwebtoken';
import {getSubdomain} from '../../lib/utils';
import { withSentry } from '@sentry/nextjs';

async function Manifest(req, res) {
  const {subdomain} = req.query;

  const token = jwt.sign({subdomain}, process.env.JWT_AUTH);

  const sdk = new Letter(token);

  const {title, description, customDomain} = await sdk.blogs.single([
    'description',
    'title',
    'customDomain'
  ]);
  res.json({
    start_url: customDomain || `https://lettercms-client-davidsdevel.vercel.app/${subdomain}`,
    description,
    icons: [{ src: '/touch-icon.png', sizes: '192x192', type: 'image/png' }],
    name: title,
    short_name: title,
    orientation: 'portrait',
    display: 'fullscreen',
    gcm_sender_id: '103953800507',
    theme_color: '#000',
    background_color: '#000',
  });
}

export default withSentry(Manifest);
