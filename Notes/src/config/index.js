const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
  dotEnv.config({path: './.env.dev'});
  
} else {
  dotEnv.config();
 
}

module.exports = {
  PORT: process.env.PORT,
  DB_URI: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
  EXCHANGE_NAME: 'ENHANCE_NOTE',
  USER_SERVICE: "user_service",
  SUGGESTION_SERVICE: "suggestion_service",
  QUEUE_NAME: 'NOTES_QUEUE',
  RPC_QUEUE_NAME: 'NOTES_RPC'
};
