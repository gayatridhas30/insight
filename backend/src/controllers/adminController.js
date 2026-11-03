import { User, Organization, Event, FeedbackResponse, AuditLog } from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

export const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrganizations = await Organization.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalResponses = await FeedbackResponse.countDocuments();

    // Language distribution
    const languageStats = await FeedbackResponse.aggregate([
      { $group: { _id: '$submissionLanguage', count: { $sum: 1 } } },
    ]);

    // Sentiment distribution
    const sentimentStats = await FeedbackResponse.aggregate([
      { $group: { _id: '$sentimentLabel', count: { $sum: 1 } } },
    ]);

    // Recent system activity
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email role')
      .populate('organizationId', 'name');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrganizations,
        totalEvents,
        totalResponses,
        languageDistribution: languageStats.reduce((acc, curr) => ({ ...acc, [curr._id || 'en']: curr.count }), {}),
        sentimentDistribution: sentimentStats.reduce((acc, curr) => ({ ...acc, [curr._id || 'neutral']: curr.count }), {}),
      },
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, users });
  } catch (err) {
    next(err);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logAudit({
      req,
      action: 'ADMIN_TOGGLE_USER_STATUS',
      resourceType: 'User',
      resourceId: user._id.toString(),
      details: { email: user.email, isActive: user.isActive },
    });

    res.json({ success: true, message: `User status changed to ${user.isActive ? 'Active' : 'Suspended'}`, user });
  } catch (err) {
    next(err);
  }
};

export const getAllOrganizations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Organization.countDocuments(query);
    const organizations = await Organization.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, organizations });
  } catch (err) {
    next(err);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizationId', 'name category')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, events });
  } catch (err) {
    next(err);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const query = {};
    if (action) query.action = action;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, logs });
  } catch (err) {
    next(err);
  }
};
