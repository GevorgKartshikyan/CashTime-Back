import {
  Users, Jobs, Cvs, Messages,
} from '../models/index';

async function main() {
  await Users.sync({ alter: true });
  await Jobs.sync({ alter: true });
  await Cvs.sync({ alter: true });
  await Messages.sync({ alter: true });
  process.exit(0);
}

main();
