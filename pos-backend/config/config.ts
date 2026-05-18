import "dotenv/config";

interface Config {
  port: string | number;
  databaseURI: string;
  databaseURL: string | undefined;
  nodeEnv: string;
  frontendUrl: string;
  corsOrigin: string;
  accessTokenSecret: string | undefined;
  refreshTokenSecret: string | undefined;
  razorpayKeyId: string | undefined;
  razorpaySecretKey: string | undefined;
  razorpyWebhookSecret: string | undefined;
}

const config: Config = Object.freeze({
  port: process.env.PORT || 3000,
  databaseURI: process.env.MONGODB_URI || "mongodb://localhost:27017/pos-db",
  databaseURL: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173",
  accessTokenSecret: process.env.JWT_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpaySecretKey: process.env.RAZORPAY_KEY_SECRET,
  razorpyWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
});

export default config;
