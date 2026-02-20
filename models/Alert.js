const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const Alert = sequelize.define('Alert', {
  targetPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  UserId: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
  },
  ProductId: {
    type: DataTypes.INTEGER,
    references: { model: Product, key: 'id' },
  },
});

Alert.belongsTo(User);
Alert.belongsTo(Product);
User.hasMany(Alert);
Product.hasMany(Alert);

module.exports = Alert;
