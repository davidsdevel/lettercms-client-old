const router = require('express').Router();
const sdk = require('C:/Users/pc/Documents/Proyectos/letterCMS/davidsdevel-microservices/SDK');

router
  .get('/manifest.json', (req, res) => {
    const {title, description, customDomain} = sdk.useSubdomain(req.subdomain).blogs.single([
        'description',
        'title',
        'customDomain'
      ]);

    res.json({
      start_url: customDomain || `https://${subdomain}.letterspot.com`,
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
    res.set({
      'Content-Type': 'text/plain',
    });
    const robot = `User-agent: *
Disallow: /privacidad
Disallow: /terminos
Disallow: /search
Disallow: /feed
Allow: /

Sitemap: https://blog.davidsdevel.com/sitemap.xml`;

    res.send(robot.replace(/\t/g, ''));
  })
  .get('/feed', (req, res) => req.router.feed({ req, res }));

module.exports = router;
