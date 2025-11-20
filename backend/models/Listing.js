// backend/models/Listing.js
module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define('Listing', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    propertyType: {
      type: DataTypes.ENUM('apartment', 'house', 'villa', 'cabin', 'condo', 'townhouse', 'loft', 'other'),
      allowNull: false,
      defaultValue: 'apartment'
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'USA'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pricePerNight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    maxGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    bathrooms: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      defaultValue: 1.0
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    availableFrom: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    availableTo: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    blockedDates: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      allowNull: false,
      defaultValue: 'active'
    }
  });

  Listing.associate = (models) => {
    Listing.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
    Listing.hasMany(models.Booking, {
      foreignKey: 'listingId',
      as: 'bookings'
    });
  };

  return Listing;
};