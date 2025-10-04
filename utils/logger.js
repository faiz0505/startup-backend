// utils/logger.js

const { EventLog } = require("../lib/db/models/eventLog.model");

function logEvent({
  action,
  description = "",
  user = null,
  shop = null,
  product = null,
  review = null,
  ipAddress = null,
  metadata = {},
  createdBy = "system",
}) {
  // fire-and-forget, no await
  EventLog.create({
    action,
    description,
    user,
    shop,
    product,
    review,
    ipAddress,
    metadata,
    createdBy,
  })
    .then(() => {
      // optional: only log success in dev mode
      if (process.env.NODE_ENV === "development") {
        console.log(`Event logged: ${action}`);
      }
    })
    .catch((err) => {
      // don’t crash app if log fails
      console.error("Event logging failed:", err.message);
    });
}

module.exports = { logEvent };
