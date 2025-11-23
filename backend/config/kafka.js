const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'airbnb-app',
  brokers: ['localhost:9093'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'airbnb-group' });

// Initialize producer
const initProducer = async () => {
  await producer.connect();
  console.log('✅ Kafka Producer connected');
};

// Initialize consumer
const initConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'booking-events', fromBeginning: true });
  console.log('✅ Kafka Consumer connected and subscribed to booking-events');
};

module.exports = {
  kafka,
  producer,
  consumer,
  initProducer,
  initConsumer
};
