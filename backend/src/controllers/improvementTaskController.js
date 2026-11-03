import { ImprovementTask, Recommendation } from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

export const getTasks = async (req, res, next) => {
  try {
    const { organizationId, relatedEventId, status, priority } = req.query;

    const query = {};
    if (organizationId) query.organizationId = organizationId;
    if (relatedEventId) query.relatedEventId = relatedEventId;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await ImprovementTask.find(query)
      .populate('relatedEventId', 'title code')
      .populate('assignedTo', 'name email avatar')
      .populate('recommendationId', 'title category impact')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const {
      organizationId,
      relatedEventId,
      recommendationId,
      issue,
      recommendedAction,
      assignedTo,
      priority = 'medium',
      status = 'todo',
      dueDate,
      notes,
    } = req.body;

    if (!organizationId || !relatedEventId || !issue || !recommendedAction) {
      return res.status(400).json({
        success: false,
        message: 'organizationId, relatedEventId, issue, and recommendedAction are required.',
      });
    }

    const task = await ImprovementTask.create({
      organizationId,
      relatedEventId,
      recommendationId,
      issue,
      recommendedAction,
      assignedTo: assignedTo || null,
      priority,
      status,
      dueDate,
      notes,
    });

    if (recommendationId) {
      await Recommendation.findByIdAndUpdate(recommendationId, { isConvertedToTask: true });
    }

    await logAudit({
      req,
      action: 'IMPROVEMENT_TASK_CREATED',
      resourceType: 'ImprovementTask',
      resourceId: task._id.toString(),
      details: { issue: task.issue, priority: task.priority },
      organizationId,
    });

    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await ImprovementTask.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('relatedEventId', 'title code')
      .populate('assignedTo', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await logAudit({
      req,
      action: 'IMPROVEMENT_TASK_UPDATED',
      resourceType: 'ImprovementTask',
      resourceId: task._id.toString(),
      details: req.body,
      organizationId: task.organizationId,
    });

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await ImprovementTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};
