import { Reports } from '../models/index';

class ReportsController {
  static reportText = async (req, res, next) => {
    try {
      const { message, userId } = req.body.data;
      console.log(req.body);
      const singleReport = await Reports.findOne({
        where: {
          userId,
        },
      });
      console.log(singleReport);
      if (singleReport) {
        await singleReport.destroy();
      }
      const report = await Reports.create({
        text: message,
        userId,
      });

      res.json({
        status: 'ok',
        report,
      });
    } catch (e) {
      next(e);
    }
  };
}

export default ReportsController;
