const { Feed } = require('feed');
const {Letter} = require('C:/Users/pc/Documents/Proyectos/letterCMS/davidsdevel-microservices/SDK');

class Router {
  async sitemap({ req, res }) {
    try {
      const token = req.generateToken(req.subdomain);
      
      const sdk = new Letter(token);

      const {customDomain} = await sdk.blogs.single([
        'customDomain'
      ]);

      const { data: posts } = await sdk.posts.all({
        status: 'published',
        fields: [
          'updated',
          'url'
        ]
      });
      const {data: pages} = await sdk.pages.all({
        status: 'published',
        fields: [
          'updated',
          'url'
        ]
      });

      const data = Object.assign([], posts, pages);
      
      const domain = customDomain || `https://${req.subdomain}.letterspot.com`;

      const mapped = data.map(({ url, updated }) => `<url><changefreq>monthly</changefreq><loc>https://blog.davidsdevel.com/${url}</loc><lastmod>${updated}</lastmod><priority>1</priority></url>`);

      const finalXML = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${domain}</loc>
          <changefreq>monthly</changefreq>
          <priority>1</priority>
        </url>
        ${mapped.join('')}
      </urlset>`;

      res.set({
        'Content-Type': 'application/xml',
      });

      res.send(finalXML);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }

  async feed({ req, res }) {
    try {
      const token = req.generateToken(req.subdomain);
      const sdk = new Letter(token);

      const {title, description, customDomain, ownerEmail, thumbnail: blogThumbnail} = await sdk.blogs.single([
        'title',
        'description',
        'customDomain',
        'ownerEmail',
        'thumbnail'
      ]);

      const { data: posts } = await sdk.posts.all({
        status: 'published',
        fields: [
          'title',
          'url',
          'description',
          'content',
          'updated',
          'thumbnail'
        ]
      });

      const {name, lastname, website} = await sdk.accounts.single(ownerEmail, [
        'name',
        'lastname',
        'website'
      ]);

      const domain = customDomain || `https://${req.subdomain}.letterspot.com`;

      const feed = new Feed({
        title,
        description,
        id: domain,
        link: domain,
        language: 'es',
        image: blogThumbnail,
        favicon: `'${domain}/favicon.ico'`,
        copyright: 'Todos los derechos reservados 2021, David\'s Devel',
        updated: new Date(),
        generator: 'LetterCMS',
        feedLinks: {
          atom: `${domain}/feed`,
        },
        author: {
          name: `${name} ${lastname}`,
          email: ownerEmail,
          link: website,
        },
      });

      posts.forEach(({
        title, url, description, content, updated, thumbnail,
      }) => {
        feed.addItem({
          title,
          id: `${domain}/${url}`,
          link: `${domain}/${url}`,
          description,
          content,
          author: [
            {
              name: `${name} ${lastname}`,
              email: ownerEmail,
              link: website,
            },
          ],
          contributor: [ //TODO: use contributors
            {
              name: `${name} ${lastname}`,
              email: ownerEmail,
              link: website,
            },
          ],
          date: typeof updated === 'string' ? new Date(updated) : updated,
          image: thumbnail,
        });
      });

      const rss = feed.rss2();

      res.set({
        'Content-Type': 'application/rss+xml; charset=UTF-8',
      });

      res.send(rss);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }
}

module.exports = Router;
