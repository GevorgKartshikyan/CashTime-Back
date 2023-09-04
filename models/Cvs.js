import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './Users';

class Cvs extends Model {

}
Cvs.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  goal: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  profRole: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  language: {
    type: DataTypes.JSON,
    allowNull: true,
    default: [],
  },
  school: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  degree: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  datesAttended: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  services: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  hourlyRate: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    default: '',
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: true,
    default: [],
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    default: '',
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
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  cvPhoto: {
    type: DataTypes.STRING,
    allowNull: true,
    default: '',
  },
  geometry: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true,
    defaultValue: null,
  },
}, {
  sequelize,
  modelName: 'cvs',
  tableName: 'cvs',
});

Cvs.belongsTo(Users, {
  foreignKey: 'userId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'creator',
});

Users.hasOne(Cvs, {
  foreignKey: 'userId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'createdCvs',
});

export default Cvs;
