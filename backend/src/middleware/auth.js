import jwt from 'jsonwebtoken';
import { User, OrganizationMember } from '../models/index.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Token missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'insightloop_super_secret_jwt_key_2026_dev_mode');
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This user account has been suspended or deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please sign in again.',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role || 'unauthenticated'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

export const requireOrgRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const orgId = req.params.orgId || req.body.organizationId || req.query.orgId || req.headers['x-organization-id'];

      if (!orgId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required to verify access.',
        });
      }

      // Platform admins have universal access
      if (req.user.role === 'admin') {
        return next();
      }

      const membership = await OrganizationMember.findOne({
        organizationId: orgId,
        userId: req.user._id,
        status: 'active',
      });

      if (!membership || !allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have required permissions within this organization.',
        });
      }

      req.orgMembership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
};
