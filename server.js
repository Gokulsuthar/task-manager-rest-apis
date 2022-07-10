const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './src/config/.env' });
const app = require('./app');

const DB = `${process.env.MONGODB_LOCAL}`

mongoose
  .connect(DB,  {useNewUrlParser: true})
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;

app.use(
  '/',
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument)
);

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});