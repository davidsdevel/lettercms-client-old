module.exports.getOrigin = req => {
	if (req) {
		return req.protocol + '://' + req.get('Host');
	}

	return location.origin;
}

module.exports.getSubdomain = req => {
	if (req) {
		return req.subdomain;
	}

	return location.host.split('.')[0] || 'davidsdevel';
}

module.exports.redirect = (req, res, url) => {
  if (req) {
    res.redirect(url);
  } else {
    location.replace(url);
  }
}