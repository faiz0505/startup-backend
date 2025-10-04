const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { clerkMiddleware } = require("@clerk/express");
const webhookRoute = require("./src/routes/webhook.route");
const routes = require("./src/routes");
const { notFoundResponse } = require("./utils/response");
const { ConnectToDatabase } = require("./lib/db/connection");

const app = express();

// Global Middlewares
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || [
//       "http://localhost:3000",
//       "http://10.127.230.87:3000",
//     ],
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin || true); // allow any origin
    },
    credentials: true,
  })
);

app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    jwtKey: process.env.CLERK_JWT_KEY,
  })
);

// Connect to DB and start server
ConnectToDatabase()
  .then(() => {
    console.log("✅ Database connected");

    // Mount routes AFTER DB connection
    app.use(webhookRoute);
    app.use(express.json());

    app.use("/api/v1", routes);

    // 404 handler
    app.use((req, res) => {
      return notFoundResponse(res, "Route not found");
    });
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB", err);
    process.exit(1);
  });
