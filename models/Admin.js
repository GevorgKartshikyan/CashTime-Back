import { DataTypes, Model } from 'sequelize';
import md5 from 'md5';
import sequelize from '../services/sequelize';

const { PASSWORD_SECRET } = process.env;

class Admin extends Model {
  static passwordHash = (pass) => md5(md5(pass + PASSWORD_SECRET));
}

Admin.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val) {
      if (val) {
        this.setDataValue('password', Admin.passwordHash(val));
      }
    },
    get() {
      return undefined;
    },
  },
}, {
  sequelize,
  tableName: 'admin',
  modelName: 'admin',
  timestamps: false,
});

export default Admin;
