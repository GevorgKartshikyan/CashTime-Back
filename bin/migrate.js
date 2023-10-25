import {
  Users, Jobs, Cvs, Messages, Reports, Countries,
  SkillsBase, Notification, Admin, Files, Reviews,
} from '../models/index';

async function main() {
  await Users.sync({ alter: true });
  await Jobs.sync({ alter: true });
  await Cvs.sync({ alter: true });
  await Messages.sync({ alter: true });
  await Reports.sync({ alter: true });
  await Countries.sync({ alter: true });
  await SkillsBase.sync({ alter: true });
  await Notification.sync({ alter: true });
  await Admin.sync({ alter: true });
  await Reviews.sync({ alter: true });
  await Files.sync({ alter: true });
  process.exit(0);
}

main();
