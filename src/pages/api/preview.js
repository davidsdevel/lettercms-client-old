import _sdk from '@lettercms/sdk';

export default async (req, res) => {
  const {subdomain, id} = req.query;
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
