const Redis = require("ioredis");

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,

  maxRetriesPerRequest: 1,
});

redis.on("error", (err) => {
  console.error("Redis connection failed. Ensure Redis is running.");
});

module.exports = redis;
