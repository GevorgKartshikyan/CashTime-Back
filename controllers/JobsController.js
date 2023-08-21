// import path from 'path';
// import * as fs from 'fs';
// import { v4 as uuidV4 } from 'uuid';

class JobsController {
  static createJob = async (req, res, next) => {
    try {
      console.log(req.file, 789);
      res.json({
        // avatar,
        status: 'ok',
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  };
}
export default JobsController;
