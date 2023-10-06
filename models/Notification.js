import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './Users';
import Jobs from './Jobs';

class Notification extends Model {
}

Notification.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  done: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  method: {
    type: DataTypes.ENUM('job', 'freelancer'),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'notification',
  tableName: 'notification',
});

Notification.belongsTo(Users, {
  foreignKey: 'noticeFrom',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'userFrom',
});
Users.hasMany(Notification, {
  foreignKey: 'noticeFrom',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'notificationFor',
});
Notification.belongsTo(Users, {
  foreignKey: 'noticeTo',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'userTo',
});
Users.hasMany(Notification, {
  foreignKey: 'noticeTo',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'notificationTo',
});
Notification.belongsTo(Jobs, {
  foreignKey: 'noticeJobTo',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'fromJob',
});
Jobs.hasMany(Notification, {
  foreignKey: 'noticeJobTo',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'noticesToJob',
});
export default Notification;
