'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Plus, GripVertical, AlertTriangle, CheckSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMissionControl } from '@/lib/store';
import type { Task, TaskStatus } from '@/lib/types';
import { TaskModal } from './TaskModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MissionQueueProps {
  workspaceId?: string;
  onBackToOverview?: () => void;
}

const COLUMNS: { id: TaskStatus; label: string; description: string }[] = [
  { id: 'backlog', label: 'Backlog', description: 'Ready to be pulled' },
  { id: 'in_progress', label: 'In Progress', description: 'Currently being built' },
  { id: 'review', label: 'Review', description: 'Needs approval' },
  { id: 'done', label: 'Done', description: 'Shipped' },
];

const parseProjectTag = (value?: string) => {
  if (!value) return { label: 'General', color: '#f97316' };
  if (value.includes('|')) {
    const [label, color] = value.split('|');
    return { label: label || 'General', color: color || '#f97316' };
  }
  return { label: value, color: '#f97316' };
};

export function MissionQueue({ workspaceId, onBackToOverview }: MissionQueueProps) {
  const { tasks, updateTaskStatus, addEvent } = useMissionControl();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const targetStatus = destination.droppableId as TaskStatus;
    const movedTask = tasks.find((t) => t.id === draggableId);
    if (!movedTask || movedTask.status === targetStatus) return;

    updateTaskStatus(draggableId, targetStatus);

    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (res.ok) {
        addEvent({
          id: crypto.randomUUID(),
          type: targetStatus === 'done' ? 'task_completed' : 'task_status_changed',
          task_id: draggableId,
          message: `Task "${movedTask.title}" moved to ${targetStatus}`,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      updateTaskStatus(draggableId, movedTask.status);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Mission Queue</p>
          <h2 className="text-lg font-semibold">Kanban</h2>
        </div>
        <div className="flex items-center gap-2">
          {onBackToOverview && (
            <Button variant="outline" size="sm" onClick={onBackToOverview}>
              Overview
            </Button>
          )}
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto px-4 py-4">
          <div className="flex gap-4 min-w-max snap-x snap-mandatory">
            {COLUMNS.map((column) => {
              const columnTasks = getTasksByStatus(column.id);
              return (
                <Droppable droppableId={column.id} key={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex w-[280px] flex-col rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur',
                        snapshot.isDraggingOver && 'border-primary/60 shadow-lg'
                      )}
                    >
                      <div className="border-b border-border/60 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{column.label}</p>
                            <p className="text-xs text-muted-foreground">{column.description}</p>
                          </div>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {columnTasks.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3 p-4">
                        {columnTasks.map((task, index) => (
                          <Draggable draggableId={task.id} index={index} key={task.id}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                className={cn(
                                  'rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm transition hover:shadow-md',
                                  dragSnapshot.isDragging && 'shadow-lg'
                                )}
                                onClick={() => setEditingTask(task)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="h-2.5 w-2.5 rounded-full"
                                      style={{ backgroundColor: parseProjectTag(task.project_tag).color }}
                                    />
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {parseProjectTag(task.project_tag).label}
                                    </span>
                                  </div>
                                  <span
                                    {...dragProvided.dragHandleProps}
                                    className="inline-flex items-center justify-center rounded-md border border-border/60 bg-background/70 p-1 text-muted-foreground touch-none"
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </span>
                                </div>

                                <div className="mt-3">
                                  <h4 className="text-sm font-semibold leading-snug">{task.title}</h4>
                                  {task.description && (
                                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                      {task.description}
                                    </p>
                                  )}
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  {task.owner && (
                                    <Badge variant="secondary" className="rounded-full">
                                      {task.owner}
                                    </Badge>
                                  )}
                                  {task.blockers && task.blockers.trim().length > 0 && (
                                    <span className="inline-flex items-center gap-1 text-destructive">
                                      <AlertTriangle className="h-3 w-3" />
                                      Blocked
                                    </span>
                                  )}
                                  {task.subtasks && task.subtasks.length > 0 && (
                                    <span className="inline-flex items-center gap-1">
                                      <CheckSquare className="h-3 w-3" />
                                      {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                                  <span className="capitalize">{task.priority}</span>
                                  <span>{formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {columnTasks.length === 0 && (
                          <div className="rounded-xl border border-dashed border-border/60 bg-background/40 px-4 py-6 text-center text-xs text-muted-foreground">
                            Drop tasks here
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {showCreateModal && (
        <TaskModal onClose={() => setShowCreateModal(false)} workspaceId={workspaceId} />
      )}
      {editingTask && (
        <TaskModal task={editingTask} onClose={() => setEditingTask(null)} workspaceId={workspaceId} />
      )}
    </div>
  );
}
