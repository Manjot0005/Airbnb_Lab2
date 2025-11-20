// backend/models/Booking.js
module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Listings', key: 'id' }
    },
    travelerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    checkIn: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    checkOut: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    guests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.Listing, {
      foreignKey: 'listingId',
      as: 'listing'
    });
    Booking.belongsTo(models.User, {
      foreignKey: 'travelerId',
      as: 'traveler'
    });
  };

  return Booking;
};