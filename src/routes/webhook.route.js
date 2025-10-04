const express = require("express");
const bodyParser = require("body-parser");
const { Webhook } = require("svix");
const { clerkClient } = require("@clerk/express");
const { User } = require("../../lib/db/models/user.model");
const { logEvent } = require("../../utils/logger");

const router = express.Router();

router.post(
  "/api/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) return res.status(500).send("Missing webhook secret");

    let evt;
    try {
      evt = new Webhook(secret).verify(req.body, req.headers);
    } catch (err) {
      console.error("Signature verification failed:", err.message);
      return res.status(400).json({ message: "Invalid signature" });
    }

    const { type, data } = evt;
    const clerkUserId = data.id;

    try {
      if (type === "user.created") {
        const newUser = await User.create({
          clerkId: clerkUserId,
          email: data.email_addresses?.[0]?.email_address,
          fullName: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          profilePic: data.image_url,
        });
        if (newUser) {
          await clerkClient.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
              userId: newUser._id.toString(),
              role: null,
            },
          });99999999999999999999999999999999999999999999999999999999999999999999
          logEvent({
            action: "USER_CREATED",
            description: `New user registered via Clerk (${newUser.email})`,
            user: newUser._id,
            ipAddress: req?.ip || null, // if inside an Express route
            metadata: {
              clerkId: clerkUserId,
              source: "clerk",
            },
            createdBy: "system", // or clerk integration
          });
        }
      } else if (type === "user.updated") {
        await User.findOneAndUpdate(
          { clerkId: clerkUserId },
          {
            email: data.email_addresses?.[0]?.email_address,
            fullName: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            profilePic: data.image_url,
          },
          { new: true }
        );
      } else if (type === "user.deleted") {
        await User.findOneAndDelete({ clerkId: clerkUserId });
      } else {
        console.log("Unhandled event type:", type);
      }

      return res.status(200).json({ message: "OK" });
    } catch (err) {
      console.error("Database or Clerk update error:", err);
      return res
        .status(500)
        .json({ message: "Internal server error", error: err });
    }
  }
);

module.exports = router;
