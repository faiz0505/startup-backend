const express = require("express");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
} = require("../../utils/response");
const { User } = require("../../lib/db/models/user.model");
const { logEvent } = require("../../utils/logger");
const { clerkClient } = require("@clerk/express");
const router = express.Router();

router.post("/subscription", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { pushSubscriptions: req.body.subscription },
    });
    return successResponse(res, {}, "Subscription saved");
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});
router.patch("/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["customer", "shopkeeper"].includes(role)) {
      return errorResponse(res, "Invalid role");
    }

    const user = await User.findOneAndUpdate(
      { clerkId: req.userId },
      { role },
      { new: true }
    );

    if (!user) return notFoundResponse(res, "User not found");

    // Update Clerk publicMetadata if clerkId exists
    if (user.clerkId) {
      await clerkClient.users.updateUserMetadata(user.clerkId, {
        publicMetadata: { role, userId: user._id.toString() },
      });
    }

    // Log role change
    logEvent({
      action: "USER_ROLE_UPDATED",
      description: `User role updated to ${role}`,
      user: user._id,
      createdBy: "admin",
      metadata: { clerkId: user.clerkId, newRole: role },
    });

    return successResponse(res, user, "User role updated successfully");
  } catch (err) {
    console.error("Error updating user role:", err);
    return errorResponse(res, "Failed to update user role");
  }
});
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v").lean();

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    return successResponse(res, user, "User fetched successfully");
  } catch (err) {
    console.error("Error fetching user:", err);
    return errorResponse(res, "Failed to fetch user");
  }
});
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-__v");

    if (!updatedUser) {
      return notFoundResponse(res, "User not found");
    }

    return successResponse(res, updatedUser, "User updated successfully");
  } catch (err) {
    console.error("Error updating user:", err);
    return errorResponse(res, "Failed to update user");
  }
});

module.exports = router;
