import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

class Jobs extends Model {

}
Jobs.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'jobs',
  tableName: 'jobs',
});

export default Jobs;
