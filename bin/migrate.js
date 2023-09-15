import {
  Users, Jobs, Cvs, Messages, Reports, Countries,
} from '../models/index';

async function main() {
  await Users.sync({ alter: true });
  await Jobs.sync({ alter: true });
  await Cvs.sync({ alter: true });
  await Messages.sync({ alter: true });
  await Reports.sync({ alter: true });
  await Countries.sync({ alter: true });
  process.exit(0);
}

main();
