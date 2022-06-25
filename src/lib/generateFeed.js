import {Letter} from '@lettercms/sdk';
import jwt from 'jsonwebtoken';
import {getSubdomain} from './utils';

export default async function feed(req, res) {
    try {
      const token = jwt.sign({subdomain: getSubdomain(req)}, process.env.JWT_AUTH);
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
