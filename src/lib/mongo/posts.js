import connection from '@lettercms/utils/lib/connection';
import modelFactory from '@lettercms/models';

let mongo = connection.mongoose;

export async function getBlog(subdomain, url) {
  if (!mongo) {
    await connection.connect();

    mongo = connection.mongoose;
  }

  const {blogs, posts} = modelFactory(mongo, ['blogs', 'posts']);
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

  if (postsData?.postStatus !== 'publisher')
    return Promise.resolve({
      post: {
        notFound: true
      }
    });

  return Promise.resolve({
    post: postsData,
    blog: blogData
  });
}
