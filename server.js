import express from "express";
import session from "express-session";
import { RedisStore } from "connect-redis";
import redis from "redis";

const app = express();
const PORT = 3000;

// Create Redis client
const redisClient = redis.createClient();
redisClient.on("error", (err) => console.error("Redis error:", err));
await redisClient.connect().catch(console.error);

// Configure session middleware
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "your-secret-key", // Use environment variable for secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      httpOnly: true,
      maxAge: 60000, // 1 minute
    },
  })
);

app.get("/", (req, res) => {
  if (!req.session.views) {
    req.session.views = 1;
  } else {
    req.session.views++;
  }

  res.send(`Number of views: ${req.session.views}`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Closing Redis client...");
  await redisClient.quit();
  process.exit(0);
});
