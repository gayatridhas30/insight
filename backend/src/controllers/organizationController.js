import { Organization, OrganizationMember, User } from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

export const createOrganization = async (req, res, next) => {
  try {
    const { name, category, description, website } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Organization name is required.' });
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const org = await Organization.create({
      name,
      slug,
      category: category || 'college',
      description: description || '',
      website: website || '',
      createdBy: req.user._id,
    });

    await OrganizationMember.create({
      organizationId: org._id,
      userId: req.user._id,
      role: 'owner',
      status: 'active',
    });

    await logAudit({
      req,
      action: 'ORGANIZATION_CREATED',
      resourceType: 'Organization',
      resourceId: org._id.toString(),
      details: { name: org.name, slug: org.slug },
      organizationId: org._id,
    });

    res.status(201).json({
      success: true,
      organization: {
        id: org._id,
        name: org.name,
        slug: org.slug,
        category: org.category,
        description: org.description,
        role: 'owner',
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyOrganizations = async (req, res, next) => {
  try {
    const memberships = await OrganizationMember.find({ userId: req.user._id, status: 'active' })
      .populate('organizationId')
      .lean();

    const organizations = memberships
      .filter((m) => m.organizationId)
      .map((m) => ({
        ...m.organizationId,
        id: m.organizationId._id,
        role: m.role,
      }));

    res.json({ success: true, organizations });
  } catch (err) {
    next(err);
  }
};

export const getOrganizationById = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const members = await OrganizationMember.find({ organizationId: org._id })
      .populate('userId', 'name email avatar phone')
      .lean();

    res.json({
      success: true,
      organization: org,
      members: members.map((m) => ({
        id: m._id,
        userId: m.userId?._id,
        name: m.userId?.name,
        email: m.userId?.email,
        avatar: m.userId?.avatar,
        role: m.role,
        status: m.status,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { email, role = 'member' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'User email is required to invite.' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Create invited user placeholder
      const bcrypt = (await import('bcryptjs')).default;
      const dummyHash = await bcrypt.hash(Math.random().toString(36), 8);
      user = await User.create({
        name: email.split('@')[0],
        email: email.toLowerCase(),
        passwordHash: dummyHash,
        role: 'host',
      });
    }

    const existingMembership = await OrganizationMember.findOne({
      organizationId: orgId,
      userId: user._id,
    });

    if (existingMembership) {
      return res.status(409).json({ success: false, message: 'User is already a member of this organization.' });
    }

    const membership = await OrganizationMember.create({
      organizationId: orgId,
      userId: user._id,
      role,
      status: 'active',
      invitedBy: req.user._id,
    });

    await logAudit({
      req,
      action: 'MEMBER_INVITED',
      resourceType: 'OrganizationMember',
      resourceId: membership._id.toString(),
      details: { invitedEmail: email, role },
      organizationId: orgId,
    });

    res.status(201).json({
      success: true,
      message: `User ${email} added as ${role}.`,
      member: {
        id: membership._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: membership.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateMemberRole = async (req, res, next) => {
  try {
    const { orgId, memberId } = req.params;
    const { role } = req.body;

    if (!['admin', 'member', 'analyst'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const member = await OrganizationMember.findOne({ _id: memberId, organizationId: orgId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in this organization.' });
    }

    if (member.role === 'owner') {
      return res.status(403).json({ success: false, message: 'Cannot modify primary organization owner.' });
    }

    member.role = role;
    await member.save();

    res.json({ success: true, message: 'Member role updated successfully', member });
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { orgId, memberId } = req.params;

    const member = await OrganizationMember.findOne({ _id: memberId, organizationId: orgId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (member.role === 'owner') {
      return res.status(403).json({ success: false, message: 'Cannot remove organization owner.' });
    }

    await member.deleteOne();

    res.json({ success: true, message: 'Member removed from organization.' });
  } catch (err) {
    next(err);
  }
};
