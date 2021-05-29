const router = require('express').Router();
const {Letter} = require('@lettercms/sdk');

router
  .get('/manifest.json', (req, res) => {
    const token = req.generateToken(req.subdomain);

    const sdk = new Letter(token);

    const {title, description, customDomain} = sdk.blogs.single([
      'description',
      'title',
      'customDomain'
    ]);

    res.json({
      start_url: customDomain || `https://${req.subdomain}.letterspot.com`,
      description,
      icons: [{ src: '/touch-icon.png', sizes: '192x192', type: 'image/png' }],
      name: title,
      short_name: title,
      orientation: 'portrait',
      display: 'fullscreen',
      gcm_sender_id: '103953800507',
      theme_color: '#000',
      background_color: '#000',
    });
  })
  .get('/sitemap.xml', (req, res) => req.router.sitemap({ req, res }))
  .get('/robots.txt', (req, res) => {
    const token = req.generateToken(req.subdomain);

    const sdk = new Letter(token);

    const blog = sdk.blogs.single([
      'customDomain',
      'hasCustomRobots',
      'isVisible',
      'robots'
    ]);

    res.set({
      'Content-Type': 'text/plain',
    });

    let robots;

    if (blog.hasCustomRobots)
      robots = blog.robots;
    else {
      if (blog.isVisible) {
        robots = `User-agent: *
          Disallow: /privacidad
          Disallow: /terminos
          Disallow: /search
          Disallow: /feed
          Allow: /

          Sitemap: https://${customDomain || req.subdomain+'.letterspot.com'}/sitemap.xml`;
      }
      else 
        robots = `User-agent: *
          Disallow: *`;

    }

    res.send(robot.replace(/\r?\n?\s*/g, ''));
  })
  .get('/feed', (req, res) => req.router.feed({ req, res }));

module.exports = router;
