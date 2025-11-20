// backend/models/Favorite.js - FIXED VERSION
module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Listings',
        key: 'id'
      }
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'listingId']
      }
    ]
  });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Favorite.belongsTo(models.Listing, {
      foreignKey: 'listingId',
      as: 'listing'
    });
  };

  return Favorite;
};