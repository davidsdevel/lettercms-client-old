import connect from './connect';
import modelFactory from '@lettercms/models';
import jwt from 'jsonwebtoken';
import {generateFullUrl} from './posts';

export async function getPathType(subdomain, paths = []) {
  const mongo = await connect();
  const {posts, pages, blogs} = modelFactory(mongo, ['posts', 'pages', 'blogs']);
  const blog = await blogs.findOne({subdomain}, 'mainUrl url', {lean: true});

  if (!blog)
    return 'no-blog';

  const {mainUrl, url: urlID} = blog;
  if (paths?.length === 0) {
    if (!mainUrl)
      return 'main';
    if (mainUrl !== '')
      return 'not-found';
  }

  const pathsJoined = '/' + paths.join('/');

  if (pathsJoined === mainUrl)
    return 'main';

  const page = await pages.findOne({subdomain, url: paths[0]}, 'url', {lean: true});
  if (page?.url === paths[0])
    return 'page';

  const url = pathsJoined.replace(mainUrl + '/', '').split('/');
  const post = await posts.findOne({subdomain, url: url[url.length - 1], postStatus: 'published'}, 'url published category', {lean: true});

  if (!post)
    return 'not-found';

  if (url.length == 1 && urlID === '1') {
    if (url[0] === post.url)
      return 'post';
  }
  if (url.length == 2 && urlID === '2') {
    if (url[0] === post.category && post.url === url[1])
      return 'post';
  }
  const year = post.published.getFullYear();
  const month = post.published.getMonth() + 1;

  if (url.length == 3 && urlID === '3') {
    if (url[0] == year && month == url[1] && post.url === url[2])
      return 'post';
  }

  const day = post.published.getDate();
  if (url.length == 4 && urlID === '4') {
    if (url[0] == year && month == url[1] && day == url[2] && post.url === url[3])
      return 'post';
  }

  return 'not-found';
}

export async function existsBlog(subdomain) {
  const mongo = await connect();
  
  const {blogs} = modelFactory(mongo, ['blogs']);

  return blogs.exists({subdomain});
}

export async function getSubdomains() {
  const mongo = await connect();

  const {blogs} = modelFactory(mongo, ['blogs']);

  const blogData = await blogs.find({}, 'subdomain', {lean: true});

  return Promise.resolve(blogData.map(({subdomain}) => ({params: {subdomain}})));
}

export async function getBlog(subdomain, page) {
  const mongo = await connect();

  const {blogs, posts} = modelFactory(mongo, ['blogs', 'posts']);
  const blogData = await blogs.findOne({subdomain}, 'categories description title url mainUrl', {lean: true});

  if (!blogData)
    return Promise.resolve({
      notFound: true
    });

  delete blogData._id;

  const postsData = await posts.find({subdomain, postStatus: 'published'}, 'subdomain description title images url thumbnail comments category', {
    lean: true,
    limit: 10, 
    sort: {
      published: -1
    }});

  return Promise.resolve({
    posts: postsData.map(e => {
      e._id = e._id.toString();
      e.fullUrl = generateFullUrl({...e, urlID: blogData.url, basePath: blogData.mainUrl});
      return e;
    }),
    blog: blogData,
    accessToken: jwt.sign({subdomain}, process.env.JWT_AUTH)
  });
}
