'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowRight, Folder, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { WorkspaceStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function WorkspaceDashboard() {
  const [workspaces, setWorkspaces] = useState<WorkspaceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces?stats=true');
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🧭</div>
          <p className="text-muted-foreground">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-gradient-to-r from-background via-background to-card/60">
        <div className="container flex items-center justify-between py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Nix</p>
            <h1 className="text-2xl font-semibold">Mission Control</h1>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            New Workspace
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Workspaces</h2>
          <p className="text-muted-foreground text-sm">
            Jump into your workspace and keep the queue moving.
          </p>
        </div>

        {workspaces.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-card/40">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Folder className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No workspaces yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first workspace to get started.
              </p>
              <Button className="mt-6" onClick={() => setShowCreateModal(true)}>
                Create Workspace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onDelete={(id) => setWorkspaces(workspaces.filter((w) => w.id !== id))}
              />
            ))}

            <button
              onClick={() => setShowCreateModal(true)}
              className="group flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/40 px-6 py-10 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background/80">
                <Plus className="h-5 w-5" />
              </span>
              Add Workspace
            </button>
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadWorkspaces();
          }}
        />
      )}
    </div>
  );
}

function WorkspaceCard({ workspace, onDelete }: { workspace: WorkspaceStats; onDelete: (id: string) => void }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete(workspace.id);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete workspace');
      }
    } catch {
      alert('Failed to delete workspace');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Link href={`/workspace/${workspace.slug}`}>
        <Card className="group h-full transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{workspace.icon}</span>
              <div>
                <CardTitle className="text-lg">{workspace.name}</CardTitle>
                <CardDescription>/{workspace.slug}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {workspace.id !== 'default' && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="rounded-full border border-border/60 p-1.5 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
            <Badge variant="secondary" className="rounded-full">
              {workspace.taskCounts.total} tasks
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {workspace.agentCount} agents
            </Badge>
          </CardContent>
        </Card>
      </Link>

      {showDeleteConfirm && (
        <Dialog open onOpenChange={(open) => !open && setShowDeleteConfirm(false)}>
          <DialogContent className="h-[100dvh] w-screen max-w-none p-0 !left-0 !top-0 !translate-x-0 !translate-y-0 sm:!left-[50%] sm:!top-[50%] sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:h-auto sm:max-w-md sm:rounded-2xl">
            <DialogHeader className="border-b border-border/60 px-6 py-4">
              <DialogTitle>Delete Workspace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 px-6 py-6">
              <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                This action cannot be undone.
              </div>
              <p className="text-sm text-muted-foreground">
                Delete <strong>{workspace.name}</strong>? You must remove tasks and agents first.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border/60 px-6 py-4">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting || workspace.taskCounts.total > 0 || workspace.agentCount > 0}
              >
                {deleting ? 'Deleting...' : 'Delete Workspace'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function CreateWorkspaceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🧭');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const icons = ['🧭', '📁', '💼', '🏢', '🚀', '💡', '🎯', '📊', '🔧', '🌟'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), icon }),
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create workspace');
      }
    } catch {
      setError('Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[100dvh] w-screen max-w-none p-0 !left-0 !top-0 !translate-x-0 !translate-y-0 sm:!left-[50%] sm:!top-[50%] sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:h-auto sm:max-w-md sm:rounded-2xl">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {icons.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`h-10 w-10 rounded-lg border ${
                    icon === i ? 'border-primary bg-primary/10' : 'border-border/60 bg-background'
                  } text-xl`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., General"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
