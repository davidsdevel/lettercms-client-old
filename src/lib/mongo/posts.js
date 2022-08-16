import connection from '@lettercms/utils/lib/connection';
import modelFactory from '@lettercms/models';
import jwt from 'jsonwebtoken';

let mongo = connection.mongoose;

export async function getPost(subdomain, url, userID) {
  if (!mongo) {
    await connection.connect();

    mongo = connection.mongoose;
  }

  const {blogs, posts, users: {Ratings}} = modelFactory(mongo, ['blogs', 'posts', 'ratings']);
  const blogData = await blogs.findOne({subdomain}, 'title', {lean: true});

  if (!blogData)
    return Promise.resolve({
      blog: {
        notFound: true
      }
    });

  const postData = await posts.findOne({
    subdomain,
    url
  },
  'images content title tags updated description category description published authorEmail thumbnail',
  {
    lean: true,
    populate: {
      path: 'author',
      select: 'name lastname description photo facebook twitter instagram linkedin website'
    }
  });

  if (postsData?.postStatus !== 'published')
    return Promise.resolve({
      post: {
        notFound: true
      }
    });


  const similars = await getSimilars(posts, {
    subdomain,
    tags: postsData.tags || [],
    actual: postData.url,
    hasRecommend: !!userID
  });

  const similar = similars[0];
  let recommended;

  if (!userID)
    recommended = similars[1];
  else
    recommended = await getRecommended(Ratings, userID, {
      subdomain,
      actual: postData._id,
      similar: similar._id
    });

  return Promise.resolve({
    post: postsData,
    blog: blogData,
    similar,
    recommended,
    accessToken: jwt.sign({subdomain}, process.env.JWT_AUTH)
  });
}

async function getSimilars(model, {
  subdomain,
  tags,
  actual,
  hasRecommend
}) {
  const tagsMapped = tags.map(e => ({tags: {$in: e}}));
  
  const similars = await model.find({
    subdomain,
    $nor:[{actual}],
    $or: tagsMapped,
    postStatus: 'published'
  },
  'tags url',
  {
    lean: true
  });

  let ordered = similars.map(e => {
    let matches = 0;
    e.tags.forEach(t => {
      if (tags.includes(t))
        matches++;
    });
    return {
      matches,
      _id: e._id
    }
  }).sort((a,b) => a.matches > b.matches ? -1 : +1);

  const _similars = [];

  _similars[0] = await model.findOne({subdomain, url: ordered[0].url}, 'title description thumbnail views comments', {lean: true});

  if (!hasRecommend)
    _similars[1] = await model.findOne({subdomain, url: ordered[1].url}, 'title description thumbnail views comments', {lean: true});

  return Promise.resolve(_similars);
}

async function getRecommended(model, userID, {
  subdomain,
  actual,
  similar
}) {
  const rated = await Ratings.findOne({
      subdomain,
      $and: [
        {post: {$ne: actual}},
        {post: {$ne: similar}}
      ]
    },
    'post'
    , {
      populate: {
        path: 'post',
        select: 'title description thumbnail views comments'
      },
      sort: {
        viewed: 1,
        rating: -1
      },
      lean: true
    });

  return Promise.resolve(rated.post);
}