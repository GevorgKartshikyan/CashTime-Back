import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

const EXCLUDE = [
  'POST:/users/login',
  'POST:/users/register',
  'POST:/users/activate',
  'POST:/users/resetPassword',
  'POST:/users/resetPasswordConfirm',
  'POST:/utils/create-countries',
  'POST:/utils/create-base-skills',
  'GET:/test',
];
export default function userAuthorization(req, res, next) {
  try {
    const { authorization = '' } = req.headers;
    const { path, method } = req;
    if (method === 'OPTIONS' || EXCLUDE.includes(`${method}:${path}`)) {
      next();
      return;
    }
    const { userId } = jwt.verify(authorization, JWT_SECRET);
    // console.log(userId);
    req.userId = userId;

    next();
  } catch (e) {
    e.status = 401;
    next(e);
  }
}
