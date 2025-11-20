const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'airbnb-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'booking-group' });

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'booking.created' });
  await consumer.subscribe({ topic: 'booking.accepted' });
  
  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`📨 Received ${topic}:`, data);
      
      if (topic === 'booking.created') {
        console.log('✅ Owner notified of new booking');
      }
      if (topic === 'booking.accepted') {
        console.log('✅ Traveler notified booking accepted');
      }
    }
  });
}

module.exports = { startConsumer };
