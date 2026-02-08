'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Settings, ChevronLeft, LayoutGrid, Menu, Bolt } from 'lucide-react';
import { useMissionControl } from '@/lib/store';
import { format } from 'date-fns';
import type { Workspace } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  workspace?: Workspace;
  onToggleSidebar?: () => void;
}

export function Header({ workspace, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const { agents, tasks, isOnline } = useMissionControl();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSubAgents, setActiveSubAgents] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load active sub-agent count
  useEffect(() => {
    const loadSubAgentCount = async () => {
      try {
        const res = await fetch('/api/openclaw/sessions?session_type=subagent&status=active');
        if (res.ok) {
          const sessions = await res.json();
          setActiveSubAgents(sessions.length);
        }
      } catch (error) {
        console.error('Failed to load sub-agent count:', error);
      }
    };

    loadSubAgentCount();

    // Poll every 10 seconds
    const interval = setInterval(loadSubAgentCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const workingAgents = agents.filter((a) => a.status === 'working').length;
  const activeAgents = workingAgents + activeSubAgents;
  const tasksInQueue = tasks.filter((t) => t.status !== 'done').length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3 min-w-0">
        {workspace && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden -ml-2 rounded-md p-2 text-muted-foreground hover:bg-muted"
            aria-label="Toggle sidebar"
            type="button"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bolt className="h-5 w-5" />
          </span>
          <div>
            <span className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">Nix</span>
            <span className="text-sm font-semibold">Mission Control</span>
          </div>
        </div>

        {/* Workspace indicator or back to dashboard */}
        {workspace ? (
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <LayoutGrid className="w-4 h-4" />
            </Link>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-2 py-1 sm:px-3 min-w-0">
              <span className="text-lg">{workspace.icon}</span>
              <span className="font-medium text-sm sm:text-base truncate">
                {workspace.name}
              </span>
            </div>
          </div>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 transition-colors hover:bg-muted"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-sm">All Workspaces</span>
          </Link>
        )}
      </div>

      {/* Center: Stats - only show in workspace view */}
      {workspace && (
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            <Zap className="h-3 w-3" />
            {activeAgents} active agents
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            {tasksInQueue} tasks in flight
          </Badge>
        </div>
      )}

      {/* Right: Time & Status */}
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden sm:inline text-muted-foreground text-sm">
          {format(currentTime, 'HH:mm:ss')}
        </span>
        <Badge
          variant={isOnline ? 'default' : 'destructive'}
          className="rounded-full px-3 py-1 text-xs"
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/settings')}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
