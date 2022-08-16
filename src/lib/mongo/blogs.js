import connection from '@lettercms/utils/lib/connection';
import modelFactory from '@lettercms/models';
import jwt from 'jsonwebtoken';

let mongo = connection.mongoose;

export async function getSubdomains() {
  if (!mongo) {
    await connection.connect();

    mongo = connection.mongoose;
  }

  const {blogs} = modelFactory(mongo, ['blogs']);

  const blogData = await blogs.find({}, 'subdomain', {lean: true});

  return Promise.resolve(blogData.map(({subdomain}) => ({params: {subdomain}})));
}

export async function getBlog(subdomain, page) {
  if (!mongo) {
    await connection.connect();

    mongo = connection.mongoose;
  }

  const {blogs, posts} = modelFactory(mongo, ['blogs', 'posts']);
  const blogData = await blogs.findOne({subdomain}, 'categories description title url', {lean: true});

  if (!blogData)
    return Promise.resolve({
      notFound: true
    });

  const postsData = await posts.find({subdomain, postStatus: 'published'}, 'description title images url thumbnail comments category', {lean: true, limit: 10});

  return Promise.resolve({
    posts: postsData,
    blog: blogData,
    accessToken: jwt.sign({subdomain}, process.env.JWT_AUTH)
  });
}

export async function getRecommended(subdomain, userID) {
  if (!mongo) {
    await connection.connect();

    mongo = connection.mongoose;
  }

  const {blogs, users: {Ratings}} = modelFactory(mongo, ['blogs', 'ratings', '']);

  const blog = await blogs.findOne({subdomain}, 'categories description title url', {lean: true});

  if (!blog)
    return Promise.resolve({
      notFound: true
    });

  const postsData = await Ratings.find({userID}, 'post', {
    lean: true,
    populate: {
      path: 'post',
      select: 'description title images url thumbnail comments category'
    },
    sort: {
      viewed: 1,
      rating: -1
    }
  });

  if (postsData.lenght === 0)
    return Promise.resolve({
      notFound: true
    });

  return Promise.resolve({
    posts: postsData.map(({post}) => post),
    blog,
    accessToken: jwt.sign({subdomain}, process.env.JWT_AUTH)
  });
}
