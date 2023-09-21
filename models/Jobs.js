import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './Users';

class Jobs extends Model {

}
Jobs.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: true,
    default: [],
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  priceMinHourly: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  priceMaxHourly: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  priceFixed: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  priceMethod: {
    type: DataTypes.ENUM('Project Budget', 'Hourly Rate'),
    allowNull: true,
    default: '',
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  jobPhoto: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  geometry: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('active', 'pending'),
    allowNull: false,
  },
  alreadyDone: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  fullAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
}, {
  sequelize,
  modelName: 'jobs',
  tableName: 'jobs',
});

Jobs.belongsTo(Users, {
  foreignKey: 'userId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'creator',
});

Users.hasMany(Jobs, {
  foreignKey: 'userId',
  as: 'createdJobs',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});
Users.hasOne(Jobs, {
  foreignKey: 'userId',
  as: 'createdJob',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});

export default Jobs;
