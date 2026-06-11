const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get all notifications for a specific officer
router.get('/:email', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientEmail: req.params.email })
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a single notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications for a user as read
router.put('/read-all/:email', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientEmail: req.params.email, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
