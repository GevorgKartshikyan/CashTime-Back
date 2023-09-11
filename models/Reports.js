import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './Users';

class Reports extends Model {
}

Reports.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    default: '',
  },
}, {
  sequelize,
  modelName: 'reports',
  tableName: 'reports',
});

Reports.belongsTo(Users, {
  foreignKey: 'userId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'reportedUser',
});

Users.hasOne(Reports, {
  foreignKey: 'userId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'report',
});
export default Reports;
