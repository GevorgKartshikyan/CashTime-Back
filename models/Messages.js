import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

class Messages extends Model {

}

Messages.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'messages',
  tableName: 'messages',
});

export default Messages;
