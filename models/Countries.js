import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

class Countries extends Model {

}

Countries.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  label: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING(2),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'countries',
  modelName: 'countries',
  timestamps: false,
});

export default Countries;
