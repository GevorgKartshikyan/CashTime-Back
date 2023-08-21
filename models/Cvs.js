import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

class Cvs extends Model {

}
Cvs.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'cvs',
  tableName: 'cvs',
});

export default Cvs;
