import connection from '@lettercms/utils/lib/connection';
import modelFactory from '@lettercms/models';
import jwt from 'jsonwebtoken';

let mongo = connection.mongoose;

export async function getUrls() {
    if (!mongo) {
    await connection.connect();

    mongo = connection.mongoose;
  }


  const {posts} = modelFactory(mongo, ['posts']);

  const postData = await posts.find({postStatus: 'published'}, 'url subdomain', {lean: true, limit: 100});

  return Promise.resolve(postData.map(e => {
    return {
      params: {
        subdomain: e.subdomain,
        post: e.url
      }
    }
  }));
}

export async function getPost(subdomain, url, userID) {
  if (!mongo) {
    await connection.connect();

    mongo = connection.mongoose;
  }

  const {blogs, posts, users: {Ratings}} = modelFactory(mongo, ['accounts','blogs', 'posts', 'ratings']);
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
  'images url content title tags postStatus updated category description published authorEmail thumbnail',
  {
    lean: true,
    populate: {
      path: 'author',
      select: 'name lastname description photo facebook twitter instagram linkedin website'
    }
  });

  if (postData?.postStatus !== 'published')
    return Promise.resolve({
      post: {
        notFound: true
      }
    });


  const similars = await getSimilars(posts, {
    subdomain,
    tags: postData.tags || [],
    actual: postData._id,
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

  recommended._id = recommended._id.toString();
  similar._id = similar._id.toString();
  postData._id = postData._id.toString();
  postData.updated = postData.updated.toISOString();
  postData.published = postData.published.toISOString();
  postData.author._id = postData.author._id.toString();

  delete blogData._id;

  return Promise.resolve({
    post: postData,
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
    $nor:[{_id: actual}],
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

  if (ordered.length < 1) {
    ordered = await model.find({_id: {$ne: actual}, subdomain, postStatus: 'published'}, 'url', {lean: true, sort: {published: -1}, limit: 2});
  } else if (ordered.length < 2) {
    ordered[1] = await model.findOne({_id: {$ne: actual}, subdomain, postStatus: 'published'}, 'url', {lean: true, sort: {published: -1}});   
  }

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