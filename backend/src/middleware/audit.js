import { AuditLog } from '../models/index.js';

export const logAudit = async ({
  req,
  action,
  resourceType,
  resourceId = '',
  details = {},
  organizationId = null,
}) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const userId = req.user ? req.user._id : null;
    const orgId = organizationId || req.orgMembership?.organizationId || null;

    await AuditLog.create({
      organizationId: orgId,
      userId,
      action,
      resourceType,
      resourceId,
      ipAddress,
      userAgent,
      details,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
};
