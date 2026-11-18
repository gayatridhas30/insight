import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckSquare,
  Plus,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { improvementTaskService, eventService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

export const ImprovementTrackerPage = () => {
  const { t } = useTranslation();
  const { activeOrganization } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    relatedEventId: '',
    issue: '',
    recommendedAction: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchTasksAndEvents();
  }, [activeOrganization, statusFilter]);

  const fetchTasksAndEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const [tasksRes, evtsRes] = await Promise.all([
        improvementTaskService.getTasks(params),
        eventService.getEvents({ limit: 50 }),
      ]);

      if (tasksRes.data?.success) setTasks(tasksRes.data.tasks || []);
      if (evtsRes.data?.success) setEvents(evtsRes.data.events || []);
    } catch (err) {
      console.warn('Tasks fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await improvementTaskService.updateTask(taskId, { status: newStatus });
      fetchTasksAndEvents();
    } catch (err) {
      alert(t('tracker.updateStatusFailed'));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm(t('tracker.deleteConfirm'))) {
      try {
        await improvementTaskService.deleteTask(taskId);
        fetchTasksAndEvents();
      } catch (err) {
        alert(t('tracker.deleteFailed'));
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.relatedEventId) {
      alert(t('tracker.selectEventRequired'));
      return;
    }

    try {
      await improvementTaskService.createTask({
        organizationId: activeOrganization?.id || activeOrganization?._id,
        ...taskForm,
      });
      setIsModalOpen(false);
      setTaskForm({
        relatedEventId: '',
        issue: '',
        recommendedAction: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        notes: '',
      });
      fetchTasksAndEvents();
    } catch (err) {
      alert(t('tracker.createFailed', { message: err.message }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-semibold text-navy">
        <RefreshCw size={20} className="animate-spin text-coral mr-2" />
        <span>{t('tracker.loading')}</span>
      </div>
    );
  }

  const statuses = [
    { id: 'all', labelKey: 'tracker.statuses.all' },
    { id: 'todo', labelKey: 'tracker.statuses.todo' },
    { id: 'in_progress', labelKey: 'tracker.statuses.inProgress' },
    { id: 'completed', labelKey: 'tracker.statuses.completed' },
    { id: 'verified', labelKey: 'tracker.statuses.verified' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-navy">
            {t('tracker.title')}
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            {t('tracker.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all active:scale-95 shrink-0"
        >
          <Plus size={16} />
          <span>{t('tracker.newTask')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === s.id
                ? 'bg-navy text-white shadow-sm'
                : 'bg-white border border-charcoal/10 text-charcoal/70 hover:text-navy'
            }`}
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>

      {/* Task Cards List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-charcoal/10 space-y-3">
          <CheckCircle2 size={36} className="text-sage-dark mx-auto" />
          <h3 className="text-base font-bold text-navy">{t('tracker.emptyTitle')}</h3>
          <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
            {t('tracker.emptyDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-charcoal/20 transition-all"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono px-2 py-0.5 rounded bg-coral/10 text-coral">
                    {task.relatedEventId?.code || t('tracker.eventFallback')}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      task.priority === 'urgent'
                        ? 'bg-coral text-white'
                        : task.priority === 'high'
                        ? 'bg-coral/20 text-coral'
                        : 'bg-lavender/50 text-navy'
                    }`}
                  >
                    {t('tracker.priorityLabel', {
                      priority: t(`tracker.priorities.${task.priority}`, { defaultValue: task.priority }),
                    })}
                  </span>
                  <span className="text-xs text-charcoal/50">
                    {task.relatedEventId?.title}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-navy">{task.issue}</h3>
                <p className="text-xs text-charcoal/70">
                  <span className="font-bold text-navy">{t('tracker.actionLabel')}</span> {task.recommendedAction}
                </p>

                {task.notes && (
                  <p className="text-[11px] text-charcoal/50 italic">{task.notes}</p>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    task.status === 'completed' || task.status === 'verified'
                      ? 'bg-sage/20 text-sage-dark border-sage-dark/30'
                      : task.status === 'in_progress'
                      ? 'bg-lavender/50 text-navy border-lavender'
                      : 'bg-ivory border-charcoal/15 text-charcoal'
                  }`}
                >
                  <option value="todo">{t('tracker.statuses.todo')}</option>
                  <option value="in_progress">{t('tracker.statuses.inProgress')}</option>
                  <option value="completed">{t('tracker.statuses.completed')}</option>
                  <option value="verified">{t('tracker.statuses.verified')}</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-2 text-charcoal/40 hover:text-coral transition-colors"
                  title={t('tracker.deleteTask')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-card border border-charcoal/10 space-y-4 animate-scaleUp">
            <h3 className="text-lg font-heading font-bold text-navy">{t('tracker.modalTitle')}</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                  {t('tracker.relatedEvent')}
                </label>
                <select
                  required
                  value={taskForm.relatedEventId}
                  onChange={(e) => setTaskForm({ ...taskForm, relatedEventId: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
                >
                  <option value="">{t('tracker.selectEvent')}</option>
                  {events.map((e) => (
                    <option key={e._id || e.id} value={e._id || e.id}>
                      {e.title} ({e.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                  {t('tracker.issueLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.issue}
                  onChange={(e) => setTaskForm({ ...taskForm, issue: e.target.value })}
                  placeholder={t('tracker.issuePlaceholder')}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                  {t('tracker.recommendedAction')}
                </label>
                <textarea
                  rows={2}
                  required
                  value={taskForm.recommendedAction}
                  onChange={(e) => setTaskForm({ ...taskForm, recommendedAction: e.target.value })}
                  placeholder={t('tracker.actionPlaceholder')}
                  className="w-full p-2.5 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    {t('tracker.formPriority')}
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-charcoal/15 bg-ivory-50"
                  >
                    <option value="low">{t('tracker.priorities.low')}</option>
                    <option value="medium">{t('tracker.priorities.medium')}</option>
                    <option value="high">{t('tracker.priorities.high')}</option>
                    <option value="urgent">{t('tracker.priorities.urgent')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    {t('tracker.formStatus')}
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-charcoal/15 bg-ivory-50"
                  >
                    <option value="todo">{t('tracker.statuses.todo')}</option>
                    <option value="in_progress">{t('tracker.statuses.inProgress')}</option>
                    <option value="completed">{t('tracker.statuses.completed')}</option>
                    <option value="verified">{t('tracker.statuses.verified')}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal border border-charcoal/15"
                >
                  {t('tracker.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-coral text-white text-xs font-bold shadow-coral-glow"
                >
                  {t('tracker.createTask')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovementTrackerPage;
