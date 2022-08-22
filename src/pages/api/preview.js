import connection from '@lettercms/utils/lib/connection';
import modelFactory from '@lettercms/models';
import jwt from 'jsonwebtoken';

let mongo = connection.mongoose;

export default async (req, res) => {
  if (!req.query.id) {
    return res.status(401).json({ message: 'Invalid ID' })
  }

  if (!mongo) {
    await connection.connect();

    mongo = connection.mongoose;
  }
  const {blogs, posts} = modelFactory(mongo, ['accounts', 'posts']);

  const existsBlog = await blogs.exists({_id: req.query.id});

  if (!existsBlog) {
    return res.status(401).json({ message: 'Invalid slug' })
  }

  res.setPreviewData({}, {
     maxAge: 60
  });

  res.redirect(`/${req.query.id}`);
}
