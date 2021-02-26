const {Letter} = require('@lettercms/sdk');

class RenderPost {
  async urlID(sdk) {
    try {
      const {url} = await sdk.blogs.single(['url']);

      return Promise.resolve(url);
    } catch(err) {
      return Promise.reject(err);
    }
  }
  async postOrPage(sdk, subdomain, url) {
    const existsPage = await Letter.existsPage({
      url,
      subdomain
    });
    const existsPost = await Letter.existsPost({
      url,
      subdomain
    });

    let id;
    let type = null

    if (existsPage){
      const {_id} = await sdk.pages.single(url, ['_id']);

      type = 'page';
      id = _id;
    }
    else if (existsPost){
      const {_id} = await sdk.posts.single(url, ['_id']);

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

      const token = req.generateToken();

      const sdk = new Letter(token);

      const ID = await this.urlID(sdk);

      console.log(ID)

      let post;

      switch(ID) {
        case '1':
          const {type, id} = await this.postOrPage(sdk, subdomain, title);
          
          if (type === null)
            return next();

          return req.renderApp(req, res, `/${type}`, {ID: id});
        case '2':
          post = await sdk.posts.single(category, title, ['_id']);
          break;
        case '3':
          post = await sdk.posts.single(year, month, title, ['_id']);
          break;
        case '4':
          post = await sdk.posts.single(year, month, day, title, ['_id']);
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
