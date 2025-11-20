const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'airbnb-backend',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

async function publishBookingCreated(bookingData) {
  await producer.connect();
  await producer.send({
    topic: 'booking.created',
    messages: [{ value: JSON.stringify(bookingData) }]
  });
  console.log('✅ Booking event published to Kafka');
}

async function publishBookingAccepted(bookingId) {
  await producer.connect();
  await producer.send({
    topic: 'booking.accepted',
    messages: [{ value: JSON.stringify({ bookingId }) }]
  });
}

module.exports = { publishBookingCreated, publishBookingAccepted };
