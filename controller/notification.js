const BaseController  =  require("../core/BaseController");
const Notification  = require("../models/Notification")
const config =  require("../config/config");


const notificationController = new BaseController(Notification, {
  name: 'notification',
  access: 'admin',
  accessKey:'admin',
  get: {
    pagination: config.pagination,
     query: ["title"],
     
  },
  create: {
    pre: async (payload, req, res) => {
      // Ensure JSON body is present and content exists
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized: Missing user info' });
      }
      // Attach userId and return mutated payload
      payload.createdBy = req.user._id;
      return payload;
    },
  },
});

// GET /api/notifications/inbox?search=&newPage=1&newLimit=10&oldPage=1&oldLimit=10&hours=24
notificationController.getInbox = async (req, res) => {
  try {
    // Admin-only per your BaseController config, remove guard if not needed
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const search = (req.query.search || '').trim();
    const hours = Math.max(1, parseInt(req.query.hours, 10) || 24); // how far back counts as "New"
    const now = new Date();
    const since = new Date(now.getTime() - hours * 60 * 60 * 1000);

    const newPage = Math.max(1, parseInt(req.query.newPage, 10) || 1);
    const newLimit = Math.max(1, Math.min(parseInt(req.query.newLimit, 10) || 10, 100));
    const newSkip = (newPage - 1) * newLimit;

    const oldPage = Math.max(1, parseInt(req.query.oldPage, 10) || 1);
    const oldLimit = Math.max(1, Math.min(parseInt(req.query.oldLimit, 10) || 10, 100));
    const oldSkip = (oldPage - 1) * oldLimit;

    const textFilter = search
      ? { $or: [{ title: { $regex: search, $options: 'i' } }, { body: { $regex: search, $options: 'i' } }] }
      : {};

    // New notifications: created within the last N hours
    const newMatch = { createdAt: { $gte: since }, ...textFilter };

    // Earlier notifications: older than that window
    const oldMatch = { createdAt: { $lt: since }, ...textFilter };

    const [newRows, newCount, oldRows, oldCount] = await Promise.all([
      Notification.find(newMatch).sort({ createdAt: -1 }).skip(newSkip).limit(newLimit).lean(),
      Notification.countDocuments(newMatch),
      Notification.find(oldMatch).sort({ createdAt: -1 }).skip(oldSkip).limit(oldLimit).lean(),
      Notification.countDocuments(oldMatch)
    ]);

    return res.status(200).json({
      message: 'Notifications fetched',
      sections: {
        new: {
          title: 'New Notifications',
          items: newRows,
          pagination: { page: newPage, limit: newLimit, count: newCount },
          windowHours: hours
        },
        earlier: {
          title: 'Earlier Notifications',
          items: oldRows,
          pagination: { page: oldPage, limit: oldLimit, count: oldCount }
        }
      },
      search: search || null
    });
  } catch (err) {
    console.error('getInbox notifications error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};


module.exports = notificationController;    