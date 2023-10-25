import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './Users';
import Jobs from './Jobs';

class Reviews extends Model {

}
Reviews.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  rate: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'pending'),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'reviews',
  tableName: 'reviews',
});
Reviews.belongsTo(Users, {
  foreignKey: 'userFrom',
  as: 'reviewFrom',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});
Reviews.belongsTo(Users, {
  foreignKey: 'userTo',
  as: 'reviewTo',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});
Users.hasMany(Reviews, {
  foreignKey: 'userFrom',
  as: 'reviewsFrom',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});
Users.hasMany(Reviews, {
  foreignKey: 'userTo',
  as: 'reviewsTo',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});
Reviews.belongsTo(Jobs, {
  foreignKey: 'jobId',
  as: 'jobReviews',
  onUpdate: 'cascade',
  onDelete: 'set null',
});

export default Reviews;
