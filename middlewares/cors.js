const origins = [
  'https://demo.davidsdevel.tk',
  'https://www.lettercms.com',
  'https://letterspot.com',
  'https://davidsdevel-blog-test.herokuapp.com',
];

function cors (req, res, next)  {
	const origin = req.header('Origin');

	if (origins.indexOf(origin) > -1) {
	    res.header("Access-Control-Allow-Origin", origin); // update to match the domain you will make the request from
	    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	}

    next();
	/**
     * const accessToken = req.get('Access-Token');
	 *
     * if (accessToken !== process.env.ACCESS_TOKEN) { res.sendStatus(401); }
	 *
     * return next();
     */
}

module.exports = cors;
