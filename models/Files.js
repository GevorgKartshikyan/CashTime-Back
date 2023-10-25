import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Messages from './Messages';
import Reviews from './Reviews.js';

class Files extends Model {

}

Files.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'files',
  tableName: 'files',
});

Files.belongsTo(Messages, {
  foreignKey: 'messageId',
  as: 'files',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Messages.hasMany(Files, {
  foreignKey: 'messageId',
  as: 'files',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Messages.hasOne(Files, {
  foreignKey: 'messageId',
  as: 'file',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Files.belongsTo(Reviews, {
  foreignKey: 'reviewId',
  as: 'reviewFiles',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});
Reviews.hasMany(Files, {
  foreignKey: 'reviewId',
  as: 'files',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Reviews.hasOne(Files, {
  foreignKey: 'reviewId',
  as: 'file',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});
export default Files;
