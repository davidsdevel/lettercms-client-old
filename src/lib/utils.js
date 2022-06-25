import jwt from 'jsonwebtoken';

module.exports.getOrigin = req => {
	if (req) {
		return req.protocol + '://' + req.host;
	}

	return location.origin;
}

module.exports.getSubdomain = (req, query) => {
	if (req)
		return query?.subdomain || req.query?.subdomain || req.body?.subdomain || 'davidsdevel';

	return location.host.split('.')[0] || 'davidsdevel';
}

module.exports.redirect = async (req, res, url) => {
  if (req) {
    res.writeHead(307, {
      Location: url
    });
  } else {
    window.location = url;

    await new Promise(e => {});
  }
      
  return {props: {}}
}

module.exports.generateToken = subdomain => jwt.sign({subdomain}, process.env.JWT_AUTH);