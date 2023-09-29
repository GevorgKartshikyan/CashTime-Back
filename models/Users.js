import md5 from 'md5';
import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

const { PASSWORD_SECRET } = process.env;

class Users extends Model {
  static passwordHash = (pass) => md5(md5(pass + PASSWORD_SECRET));
}
Users.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
  },
  lastVisit: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'block'),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'email',
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    default: '',
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    default: '',
  },
  password: {
    type: DataTypes.CHAR(32),
    allowNull: true,
    set(val) {
      if (val) {
        this.setDataValue('password', Users.passwordHash(val));
      }
    },
    get() {
      return undefined;
    },
  },
  role: {
    type: DataTypes.ENUM('employer', 'employee'),
    allowNull: false,
  },
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true,
    default: null,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  validationCode: {
    type: DataTypes.STRING,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalJobs: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    default: 0,
  },
  jobsInProgress: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    default: 0,
  },
}, {
  sequelize,
  modelName: 'users',
  tableName: 'users',
});
export default Users;
