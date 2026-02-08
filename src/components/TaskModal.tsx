'use client';

import { useMemo, useState } from 'react';
import { Save, Trash2, Plus } from 'lucide-react';
import { useMissionControl } from '@/lib/store';
import { ActivityLog } from './ActivityLog';
import { DeliverablesList } from './DeliverablesList';
import { SessionsList } from './SessionsList';
import { AgentModal } from './AgentModal';
import type { Task, TaskPriority, TaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TabType = 'overview' | 'activity' | 'deliverables' | 'sessions';

interface TaskModalProps {
  task?: Task;
  onClose: () => void;
  workspaceId?: string;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const parseProjectTag = (value?: string) => {
  if (!value) return { label: 'General', color: '#f97316' };
  if (value.includes('|')) {
    const [label, color] = value.split('|');
    return { label: label || 'General', color: color || '#f97316' };
  }
  return { label: value, color: '#f97316' };
};

export function TaskModal({ task, onClose, workspaceId }: TaskModalProps) {
  const { agents, addTask, updateTask, addEvent } = useMissionControl();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const initialTag = useMemo(() => parseProjectTag(task?.project_tag), [task?.project_tag]);

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: (task?.priority || 'normal') as TaskPriority,
    status: (task?.status || 'backlog') as TaskStatus,
    owner: task?.owner || '',
    blockers: task?.blockers || '',
    subtasks: task?.subtasks || [],
    projectTagLabel: initialTag.label,
    projectTagColor: initialTag.color,
    assigned_agent_id: task?.assigned_agent_id || '',
    due_date: task?.due_date || '',
  });

  const projectTagValue = `${form.projectTagLabel || 'General'}|${form.projectTagColor || '#f97316'}`;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = task ? `/api/tasks/${task.id}` : '/api/tasks';
      const method = task ? 'PATCH' : 'POST';

      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
        owner: form.owner || null,
        blockers: form.blockers || null,
        subtasks: form.subtasks,
        project_tag: projectTagValue,
        assigned_agent_id: form.assigned_agent_id || null,
        due_date: form.due_date || null,
        workspace_id: workspaceId || task?.workspace_id || 'default',
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedTask = await res.json();
        if (task) {
          updateTask(savedTask);
          onClose();
        } else {
          addTask(savedTask);
          addEvent({
            id: crypto.randomUUID(),
            type: 'task_created',
            task_id: savedTask.id,
            message: `New task: ${savedTask.title}`,
            created_at: new Date().toISOString(),
          });
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm(`Delete "${task.title}"?`)) return;

    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      if (res.ok) {
        useMissionControl.setState((state) => ({
          tasks: state.tasks.filter((t) => t.id !== task.id),
        }));
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[100dvh] w-screen max-w-none p-0 !left-0 !top-0 !translate-x-0 !translate-y-0 sm:!left-[50%] sm:!top-[50%] sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:h-auto sm:max-w-4xl sm:rounded-2xl">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle>{task ? task.title : 'Create New Task'}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {task ? 'Update details and keep the team aligned.' : 'Define the work before it hits the board.'}
              </p>
            </div>
            <Badge className="rounded-full" variant="default">
              {form.status.replace('_', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="flex h-full flex-col">
          {task && (
            <TabsList className="mx-6 mt-4 w-fit">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <TabsContent value="overview">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="What needs to be done?"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Add context, links, and acceptance criteria."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) => setForm({ ...form, status: value as TaskStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={form.priority}
                      onValueChange={(value) => setForm({ ...form, priority: value as TaskPriority })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Owner</Label>
                    <Input
                      value={form.owner}
                      onChange={(e) => setForm({ ...form, owner: e.target.value })}
                      placeholder="Franc, Nix, or team member"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Assign to Agent</Label>
                    <Select
                      value={form.assigned_agent_id || 'unassigned'}
                      onValueChange={(value) => {
                        if (value === '__add_new__') {
                          setShowAgentModal(true);
                          return;
                        }
                        setForm({ ...form, assigned_agent_id: value === 'unassigned' ? '' : value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.avatar_emoji} {agent.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__add_new__">Add new agent…</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="datetime-local"
                      value={form.due_date}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Blockers</Label>
                    <Textarea
                      value={form.blockers}
                      onChange={(e) => setForm({ ...form, blockers: e.target.value })}
                      placeholder="What needs to happen before this can move?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label>Subtasks</Label>
                    <div className="space-y-2">
                      {form.subtasks.map((subtask, index) => (
                        <div key={`${subtask.text}-${index}`} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                          <Checkbox
                            checked={subtask.done}
                            onCheckedChange={(checked) => {
                              const updated = [...form.subtasks];
                              updated[index] = { ...subtask, done: Boolean(checked) };
                              setForm({ ...form, subtasks: updated });
                            }}
                          />
                          <Input
                            value={subtask.text}
                            onChange={(e) => {
                              const updated = [...form.subtasks];
                              updated[index] = { ...subtask, text: e.target.value };
                              setForm({ ...form, subtasks: updated });
                            }}
                            className="h-9"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updated = form.subtasks.filter((_, i) => i !== index);
                              setForm({ ...form, subtasks: updated });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setForm({
                          ...form,
                          subtasks: [...form.subtasks, { text: '', done: false }],
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Add subtask
                    </Button>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Project Tag</Label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Input
                        value={form.projectTagLabel}
                        onChange={(e) => setForm({ ...form, projectTagLabel: e.target.value })}
                        placeholder="General"
                      />
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={form.projectTagColor}
                          onChange={(e) => setForm({ ...form, projectTagColor: e.target.value })}
                          className="h-10 w-12 rounded-md border border-border/60 bg-background p-1"
                        />
                        <span className="text-xs text-muted-foreground">Dot color on cards</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </TabsContent>

            {task && (
              <>
                <TabsContent value="activity">
                  <ActivityLog taskId={task.id} />
                </TabsContent>
                <TabsContent value="deliverables">
                  <DeliverablesList taskId={task.id} />
                </TabsContent>
                <TabsContent value="sessions">
                  <SessionsList taskId={task.id} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>

        <DialogFooter className="border-t border-border/60 px-6 py-4">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div>
              {task && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={() => handleSubmit()} disabled={isSubmitting}>
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>

      {showAgentModal && (
        <AgentModal
          workspaceId={workspaceId}
          onClose={() => setShowAgentModal(false)}
          onAgentCreated={(agentId) => {
            setForm({ ...form, assigned_agent_id: agentId });
            setShowAgentModal(false);
          }}
        />
      )}
    </Dialog>
  );
}
