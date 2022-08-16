import crypto from 'crypto';

const compare = (a, b) => {
  const [pass, salt] = b.split('.');

  const buffer = crypto.scryptSync(a, salt, 64);

  return crypto.timingSafeEqual(Buffer.from(pass, 'hex'), buffer);
};

export default async function revalidate(req, res) {
  const { paths, token } = req.body;

  const isValidToken = compare(process.env.JWT_AUTH, token);
  if (!isValidToken)
    res.status(401).json({
      status: 'Unauthorized'
    });

  try {
    await Promise.all(paths.map(path => res.revalidate(urlPath))); 

    res.status(200).json({
      status: 'OK',
    });
  } catch (error) {
    res.status(500).json({
      status: `Failed to revalidate "${urlPath}"`,
    });
  }
}
