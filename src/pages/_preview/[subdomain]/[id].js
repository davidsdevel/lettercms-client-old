import {getPost, getUrls} from '@/lib/mongo/posts';
import Post from '@/components/post';
import connection from '@lettercms/utils/lib/connection';
import modelFactory from '@lettercms/models';

export async function getServerSideProps({params: {subdomain, id}}) {
  try {
    if (!mongo) {
      await connection.connect();

      mongo = connection.mongoose;
    }
    
    const {blogs, posts} = modelFactory(mongo, ['blogs', 'posts', 'accounts']);

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

    const similars = await model.find({_id: {$ne: actual}, subdomain, postStatus: 'published'}, 'title description thumbnail views comments', {lean: true, sort: {published: -1}, limit: 2});

    return {
      props: {
        blog: blogData,
        post: postsData,
        recommended: similars[1],
        similar: similars[1]
      }
    };
  } catch (err) {
    throw err;
  }
}

export default Post;
