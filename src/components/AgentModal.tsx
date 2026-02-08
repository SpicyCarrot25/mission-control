'use client';

import { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { useMissionControl } from '@/lib/store';
import type { Agent, AgentStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AgentModalProps {
  agent?: Agent;
  onClose: () => void;
  workspaceId?: string;
  onAgentCreated?: (agentId: string) => void;
}

const EMOJI_OPTIONS = ['🤖', '🦞', '💻', '🔍', '✍️', '🎨', '📊', '🧠', '⚡', '🚀', '🎯', '🔧'];

export function AgentModal({ agent, onClose, workspaceId, onAgentCreated }: AgentModalProps) {
  const { addAgent, updateAgent } = useMissionControl();
  const [activeTab, setActiveTab] = useState<'info' | 'soul' | 'user' | 'agents'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: agent?.name || '',
    role: agent?.role || '',
    description: agent?.description || '',
    avatar_emoji: agent?.avatar_emoji || '🤖',
    status: (agent?.status || 'standby') as AgentStatus,
    is_master: agent?.is_master || false,
    soul_md: agent?.soul_md || '',
    user_md: agent?.user_md || '',
    agents_md: agent?.agents_md || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = agent ? `/api/agents/${agent.id}` : '/api/agents';
      const method = agent ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          workspace_id: workspaceId || agent?.workspace_id || 'default',
        }),
      });

      if (res.ok) {
        const savedAgent = await res.json();
        if (agent) {
          updateAgent(savedAgent);
        } else {
          addAgent(savedAgent);
          if (onAgentCreated) {
            onAgentCreated(savedAgent.id);
          }
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to save agent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!agent || !confirm(`Delete ${agent.name}?`)) return;

    try {
      const res = await fetch(`/api/agents/${agent.id}`, { method: 'DELETE' });
      if (res.ok) {
        useMissionControl.setState((state) => ({
          agents: state.agents.filter((a) => a.id !== agent.id),
          selectedAgent: state.selectedAgent?.id === agent.id ? null : state.selectedAgent,
        }));
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[100dvh] w-screen max-w-none p-0 !left-0 !top-0 !translate-x-0 !translate-y-0 sm:!left-[50%] sm:!top-[50%] sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:h-auto sm:max-w-3xl sm:rounded-2xl">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle>{agent ? `Edit ${agent.name}` : 'Create New Agent'}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="flex h-full flex-col">
          <TabsList className="mx-6 mt-4 w-fit">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="soul">SOUL.md</TabsTrigger>
            <TabsTrigger value="user">USER.md</TabsTrigger>
            <TabsTrigger value="agents">AGENTS.md</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <TabsContent value="info">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setForm({ ...form, avatar_emoji: emoji })}
                        className={`text-2xl p-2 rounded-lg border ${
                          form.avatar_emoji === emoji ? 'border-primary bg-primary/10' : 'border-border/60'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="Agent name"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Role</Label>
                    <Input
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      required
                      placeholder="e.g., Code & Automation"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      placeholder="What does this agent do?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) => setForm({ ...form, status: value as AgentStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Standby" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standby">Standby</SelectItem>
                        <SelectItem value="working">Working</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                    <Checkbox
                      checked={form.is_master}
                      onCheckedChange={(checked) => setForm({ ...form, is_master: Boolean(checked) })}
                    />
                    <Label className="text-sm">Master Orchestrator</Label>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="soul">
              <div className="space-y-2">
                <Label>SOUL.md - Agent Personality & Identity</Label>
                <Textarea
                  value={form.soul_md}
                  onChange={(e) => setForm({ ...form, soul_md: e.target.value })}
                  rows={15}
                  className="font-mono"
                  placeholder="# Agent Name\n\nDefine this agent's personality, values, and communication style..."
                />
              </div>
            </TabsContent>

            <TabsContent value="user">
              <div className="space-y-2">
                <Label>USER.md - Context About the Human</Label>
                <Textarea
                  value={form.user_md}
                  onChange={(e) => setForm({ ...form, user_md: e.target.value })}
                  rows={15}
                  className="font-mono"
                  placeholder="# User Context\n\nInformation about the human this agent works with..."
                />
              </div>
            </TabsContent>

            <TabsContent value="agents">
              <div className="space-y-2">
                <Label>AGENTS.md - Team Awareness</Label>
                <Textarea
                  value={form.agents_md}
                  onChange={(e) => setForm({ ...form, agents_md: e.target.value })}
                  rows={15}
                  className="font-mono"
                  placeholder="# Team Roster\n\nInformation about other agents this agent works with..."
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t border-border/60 px-6 py-4">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div>
              {agent && (
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
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
