import connect from './connect';
import accountSchema from '@lettercms/models/accounts/schema/account';
import postSchema from '@lettercms/models/posts/schema/posts';
import blogSchema from '@lettercms/models/blogs/schema/blogs';
import ratingSchema from '@lettercms/models/users/schema/ratings';
import jwt from 'jsonwebtoken';

export async function getPreviewPost(id, subdomain) {
  try {
    const mongo = await connect();

    mongo.model('BlogAccount', accountSchema);
    const blogs = mongo.model('Blogs', blogSchema);
    const posts = mongo.model('BlogPosts', postSchema);

    const blogData = await blogs.findOne({subdomain}, 'title', {lean: true});

    const postsData = await posts.findById(id,
    'images url content title tags postStatus updated category description published authorEmail thumbnail',
    {
      lean: true,
      populate: {
        path: 'author',
        select: 'name lastname description photo facebook twitter instagram linkedin website'
      }
    });

    const similars = await posts.find({_id: {$ne: id}, subdomain, postStatus: 'published'}, 'title description thumbnail views comments', {lean: true, sort: {published: -1}, limit: 2});

    return {
      blog: blogData,
      post: postsData,
      recommended: similars[1],
      similar: similars[1]
    };
  } catch (err) {
    throw err;
  }

}
export async function getUrls() {
  const mongo = await connect();

  const posts = mongo.model('BlogPosts', postSchema);

  const postData = await posts.find({postStatus: 'published', subdomain: 'davidsdevel'}, 'url subdomain', {lean: true, limit: 100});

  return Promise.resolve(postData.map(e => {
    return {
      params: {
        subdomain: e.subdomain,
        post: e.url
      }
    };
  }));
}

export async function getPost(subdomain, paths, userID) {
  const mongo = await connect();

  const url = paths[paths.length - 1];
  
  mongo.model('BlogAccount', accountSchema);
  const blogs = mongo.model('Blogs', blogSchema);
  const posts = mongo.model('BlogPosts', postSchema);
  const Ratings = mongo.model('BlogRatings', ratingSchema);

  const blogData = await blogs.findOne({subdomain}, 'title url mainUrl', {lean: true});

  if (!blogData)
    return Promise.resolve({
      blog: {
        notFound: true
      }
    });

  const isValidUrl = await validyUrl(subdomain, paths);
  
  if (!isValidUrl)
    return Promise.resolve({
      blog: {
        notFound: false
      },
      post: {
        notFound: true
      }
    });

  const postData = await posts.findOne({
    subdomain,
    url
  },
  'images subdomain url content title tags postStatus updated category description published author thumbnail',
  {
    lean: true,
    populate: {
      path: 'author',
      select: 'name lastname description photo facebook twitter instagram linkedin website'
    }
  });

  const hasTags = postData.tags && postData.tags?.length > 0;

  const similars = await getSimilars(posts, {
    subdomain,
    tags: hasTags && postData.tags,
    actual: postData._id,
    hasRecommend: !!userID
  });

  const similar = similars[0];
  let recommended;

  if (!userID) {
    recommended = similars[1];
    if (!recommended)
      recommended = similars[0];
  }
  else
    recommended = await getRecommended(Ratings, userID, {
      subdomain,
      actual: postData._id,
      similar: similar._id
    });

  postData.fullUrl = generateFullUrl({
    ...postData,
    urlID: blogData.url,
    basePath: blogData.mainUrl
  });
  recommended.fullUrl = generateFullUrl({
    ...recommended,
    urlID: blogData.url,
    basePath: blogData.mainUrl
  });
  similar.fullUrl = generateFullUrl({
    ...similar,
    urlID: blogData.url,
    basePath: blogData.mainUrl
  });


  if (recommended)
    recommended._id = recommended._id.toString();
  if (similar)
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

  let similars = [];

  if (tags) {
    const tagsMapped = tags.map(e => ({tags: {$in: e}}));
    const similarsTags = await model.find({
      subdomain,
      $nor:[{_id: actual}],
      $or: tagsMapped,
      postStatus: 'published'
    },
    'title description thumbnail views comments tags url',
    {
      lean: true
    });

    similars = similarsTags.map(e => {
      let matches = 0;
      e.tags.forEach(t => {
        if (tags.includes(t))
          matches++;
      });
      return {
        matches,
        _id: e._id
      };
    }).sort((a,b) => a.matches > b.matches ? -1 : +1).slice(0, 2);
  }
  
  if (similars.length === 0)
    similars = await model.find({_id: {$ne: actual}, subdomain, postStatus: 'published'}, 'title description thumbnail views comments', {lean: true, sort: {published: -1}, limit: 2});
  else if (similars.length === 1)
    similars[1] = await model.findOne({_id: {$ne: actual}, subdomain, postStatus: 'published'}, 'title description thumbnail views comments', {lean: true, sort: {published: -1}});   
  

  return Promise.resolve(similars);
}

async function getRecommended(model, userID, {
  subdomain,
  actual,
  similar
}) {
  const rated = await model.findOne({
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

async function validyUrl(subdomain, paths) {
  const mongo = await connect();

  const url = paths[paths.length - 1];

  const blogs = mongo.model('Blogs', blogSchema);
  const posts = mongo.model('BlogPosts', postSchema);
  
  const post = await posts.findOne({subdomain, url}, 'published category postStatus', {lean: true});
  
  if (post?.postStatus !== 'published')
    return Promise.resolve(false);

  const blog = await blogs.findOne({subdomain}, 'mainUrl url', {lean: true});

  const fullUrl = generateFullUrl({
    url,
    published: post.published,
    urlID: blog.url,
    basePath: blog.mainUrl,
    category: post.category
  });

  const fullPath =`/${paths.join('/')}`;

  if (fullPath === fullUrl)
    return Promise.resolve(true);

  return Promise.resolve(false);
}

export function generateFullUrl({url, urlID, published, basePath, category}) {
  if (urlID == '1')
    return `${basePath}/${url}`;

  if (urlID == '2')
    return `${basePath}/${data.category}/${url}`;

  const year = published.getFullYear();
  const month = published.getMonth() + 1;

  if (urlID == '3')
    return `${basePath}/${year}/${month}/${url}`;

  const date = published.getDate();

  return `${basePath}/${year}/${month}/${date}/${url}`;
};