import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './Users';

class Messages extends Model {

}

Messages.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
  },
  seen: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'messages',
  tableName: 'messages',
});

Messages.belongsTo(Users, {
  foreignKey: 'from',
  as: 'userFrom',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});

Users.hasMany(Messages, {
  foreignKey: 'from',
  as: 'messagesFrom',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});

Messages.belongsTo(Users, {
  foreignKey: 'to',
  as: 'userTo',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});

Users.hasMany(Messages, {
  foreignKey: 'to',
  as: 'messagesTo',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});

export default Messages;
