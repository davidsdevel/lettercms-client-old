export default async function revalidate(req, res) {

  const { path, token } = req.query;

  const isValidToken = process.env.JWT_AUTH === token;
  if (!isValidToken)
    res.status(401).json({
      status: 'Unauthorized'
    });

  try {
    const data = await req.revalidate(path); 

    res.status(200).json({
      status: 'OK',
      data
    });
  } catch (error) {
    res.status(500).json({
      status: `Failed to revalidate "${path}"`,
    });
  }
}
