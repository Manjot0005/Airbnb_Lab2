const { producer, consumer } = require('../config/kafka');

// Send booking created event
const sendBookingCreatedEvent = async (bookingData) => {
  try {
    await producer.send({
      topic: 'booking-events',
      messages: [
        {
          key: bookingData.id.toString(),
          value: JSON.stringify({
            eventType: 'BOOKING_CREATED',
            timestamp: new Date().toISOString(),
            data: bookingData
          })
        }
      ]
    });
    console.log('📤 Kafka: Booking created event sent:', bookingData.id);
  } catch (error) {
    console.error('❌ Kafka: Error sending booking created event:', error);
    throw error;
  }
};

// Send booking status update event
const sendBookingStatusUpdateEvent = async (bookingId, status, ownerId) => {
  try {
    await producer.send({
      topic: 'booking-events',
      messages: [
        {
          key: bookingId.toString(),
          value: JSON.stringify({
            eventType: 'BOOKING_STATUS_UPDATED',
            timestamp: new Date().toISOString(),
            data: {
              bookingId,
              status,
              ownerId
            }
          })
        }
      ]
    });
    console.log('📤 Kafka: Booking status update sent:', bookingId, status);
  } catch (error) {
    console.error('❌ Kafka: Error sending status update:', error);
    throw error;
  }
};

// Start consuming booking events
const startBookingEventConsumer = async () => {
  try {
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log('📥 Kafka: Received event:', event.eventType);
        
        switch (event.eventType) {
          case 'BOOKING_CREATED':
            console.log('📨 New booking received by owner:', event.data);
            break;
          case 'BOOKING_STATUS_UPDATED':
            console.log('📨 Booking status updated for traveler:', event.data);
            break;
          default:
            console.log('📨 Unknown event type:', event.eventType);
        }
      }
    });
    console.log('✅ Kafka consumer started successfully');
  } catch (error) {
    console.error('❌ Error starting Kafka consumer:', error);
  }
};

module.exports = {
  sendBookingCreatedEvent,
  sendBookingStatusUpdateEvent,
  startBookingEventConsumer
};
