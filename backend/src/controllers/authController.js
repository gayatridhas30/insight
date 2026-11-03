import jwt from 'jsonwebtoken';
import { User, Organization, OrganizationMember } from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'insightloop_super_secret_jwt_key_2026_dev_mode', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, organizationName, role = 'host', category = 'college' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const bcrypt = (await import('bcryptjs')).default;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role === 'admin' ? 'host' : role, // Admin role cannot be self-assigned via public signup
    });

    let organization = null;
    let membership = null;

    // Create default organization if host
    if (user.role === 'host') {
      const orgName = organizationName || `${name.split(' ')[0]}'s Organization`;
      const baseSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      organization = await Organization.create({
        name: orgName,
        slug: uniqueSlug,
        category,
        createdBy: user._id,
      });

      membership = await OrganizationMember.create({
        organizationId: organization._id,
        userId: user._id,
        role: 'owner',
        status: 'active',
      });
    }

    const token = generateToken(user._id);

    await logAudit({
      req,
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: user._id.toString(),
      details: { email: user.email, role: user.role },
      organizationId: organization?._id,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
      organization: organization
        ? {
            id: organization._id,
            name: organization.name,
            slug: organization.slug,
            category: organization.category,
            role: 'owner',
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated. Please contact support.' });
    }

    // Fetch user organizations
    const memberships = await OrganizationMember.find({ userId: user._id, status: 'active' })
      .populate('organizationId', 'name slug category logo isVerified')
      .lean();

    const organizations = memberships
      .filter((m) => m.organizationId)
      .map((m) => ({
        id: m.organizationId._id,
        name: m.organizationId.name,
        slug: m.organizationId.slug,
        category: m.organizationId.category,
        logo: m.organizationId.logo,
        role: m.role,
      }));

    const token = generateToken(user._id);

    await logAudit({
      req,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id.toString(),
      details: { email: user.email },
      organizationId: organizations[0]?.id,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
      organizations,
      activeOrganization: organizations[0] || null,
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    const memberships = await OrganizationMember.find({ userId: user._id, status: 'active' })
      .populate('organizationId', 'name slug category logo isVerified')
      .lean();

    const organizations = memberships
      .filter((m) => m.organizationId)
      .map((m) => ({
        id: m.organizationId._id,
        name: m.organizationId.name,
        slug: m.organizationId.slug,
        category: m.organizationId.category,
        logo: m.organizationId.logo,
        role: m.role,
      }));

    res.json({
      success: true,
      user,
      organizations,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    next(err);
  }
};
