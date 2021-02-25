const sdk = require('C:/Users/pc/Documents/Proyectos/letterCMS/davidsdevel-microservices/SDK');
const {Letter} = sdk;

class RenderPost {
  async urlID(subdomain) {
    try {
      const {url} = await sdk.useSubdomain(subdomain).blogs.single(['url']);

      return Promise.resolve(url);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  async postOrPage(subdomain, url) {
    const existsPage = await Letter.existsPage({
      url,
      subdomain
    });
    const existsPost = await Letter.existsPost({
      url,
      subdomain
    });

    const {
      pages,
      posts
    } = sdk.useSubdomain(subdomain);

    let id;
    let type = null

    if (existsPage){
      const {_id} = await pages.single(url, ['_id']);

      type = 'page';
      id = _id;
    }
    else if (existsPost){
      const {_id} = await posts.single(url, ['_id']);

      type = 'post';
      id = _id;
    }

    return Promise.resolve({
      type,
      id
    });
  }
  async render(req, res, next) {
    try {
      const {
        title,
        category,
        day,
        month,
        year
      } = req.params;

      if (/^\/(_next|images|assets)\//.test(req.url))
        return next();

      console.log(req.url);

      const {subdomain} = req;

      const ID = await this.urlID(subdomain);
      console.log(ID)

      let post;

      const {posts: withSubdomain} = sdk.useSubdomain(subdomain);

      switch(ID) {
        case '1':
          const {type, id} = await this.postOrPage(subdomain, title);
          
          if (type === null)
            return next();

          return req.renderApp(req, res, `/${type}`, {ID: id});
        case '2':
          post = await withSubdomain.single(category, title, ['_id']);
          break;
        case '3':
          post = await withSubdomain.single(year, month, title, ['_id']);
          break;
        case '4':
          post = await withSubdomain.single(year, month, day, title, ['_id']);
          break;
      }

      if (post)
        return req.renderApp(req, res, '/post', {ID: post._id});

      return next();
    } catch(err) {
      return next(err);
    }
  }
}

module.exports = RenderPost;
