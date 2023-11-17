const ALLOW = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:8081',
];
export default function cors(req, res, next) {
  try {
    const { origin } = req.headers;
    if (ALLOW.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS,DELETE,PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization,X-Token,Content-Type');
    }
    next();
  } catch (e) {
    next(e);
  }
}
