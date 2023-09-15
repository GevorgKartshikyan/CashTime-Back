import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

class SkillsBase extends Model {

}

SkillsBase.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  skill: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'skills',
  modelName: 'skills',
  timestamps: false,
});

export default SkillsBase;
