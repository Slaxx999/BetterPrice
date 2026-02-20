const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Store = require('./Store');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
  },
  url: {
    type: DataTypes.STRING,
  },
  StoreId: {
    type: DataTypes.INTEGER,
    references: {
      model: Store,
      key: 'id',
    },
  },
});

Product.belongsTo(Store);
Store.hasMany(Product);

module.exports = Product;
