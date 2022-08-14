import connection from '@lettercms/utils/lib/connection';
import modelFactory from '@lettercms/models';

let mongo = connection.mongoose;

export async function getBlog(subdomain, page) {
  if (!mongo) {
    await connection.connect();

    mongo = connection.mongoose;
  }

  const {blogs, posts} = modelFactory(mongo, ['blogs', 'posts']);
  const blogData = await blogs.findOne({subdomain}, 'categories description title url', {lean: true}),

  if (!blogData)
    return Promise.resolve({
      notFound: true
    });

  const postsData = await posts.find({subdomain, postStatus: 'published'}, 'description title images url thumbnail comments category', {lean: true, limit: 10});

  return Promise.resolve({
    posts: postsData,
    blog: blogData
  });
}
