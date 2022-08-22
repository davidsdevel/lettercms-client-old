import _sdk from '@lettercms/sdk';

export default async (req, res) => {
  const {id} = req.query;
  
  const hostname = req.headers.get('host');

  const subdomain = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1' ? hostname.replace('.lettercms-client.vercel.app', '') : hostname.replace('.localhost:3002', '');
  
  if (!id || !subdomain) {
    return res.status(401).json({ message: 'Invalid ID' })
  }

  const existsPost = await _sdk.Letter.existsPost({
    subdomain,
    _id: id
  });

  if (!existsPost) {
    return res.status(401).json({ message: 'Invalid slug' })
  }

  res.setPreviewData({}, {
     maxAge: 60
  });

  res.redirect(`/${req.query.id}`);
}
