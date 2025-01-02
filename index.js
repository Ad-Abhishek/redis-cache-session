import express from "express";
import redis from "redis";
import fetch from "node-fetch";

const app = express();
const PORT = 9090;

// Create Redis Client
const client = redis.createClient();

client.on("error", (err) => console.error("Redis error: ", err));

// Middleware to connect Redis Client
(async () => {
  await client.connect();
})();

const CACHE_TTL = 60; // Cache Time-To-Live in seconds

// API Route with caching
app.get("/data/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `data:${id}`;

  try {
    //Check Redis cache
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache Hit");
      return res.json(JSON.parse(cachedData));
    }

    console.log("Cache Miss");

    //Simulate fetching data (replace with actual API or DB call)
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );
    const data = await response.json();

    // Store data in Redis with TTL
    await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));

    res.json(data);
  } catch (error) {
    console.error("Error: ", err);
    res.status(500).send("Server Error");
  }
});

app.listen(PORT, (req, res) => {
  console.log("listening on port 9090");
});
