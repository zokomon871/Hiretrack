'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  Briefcase, 
  UserCheck, 
  Calendar, 
  Activity, 
  Database, 
  Download, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  Check, 
  X,
  Plus,
  Sparkles,
  Layers,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  superAdminUpdateCandidateStage, 
  superAdminUpdateJobStatus, 
  superAdminUpdateWorkspaceName, 
  superAdminDeleteRecord,
  superAdminCreateWorkspace,
  superAdminCreateJob,
  superAdminCreateCandidate,
  superAdminCreateUser,
  superAdminUpdateJob,
  superAdminUpdateCandidate,
  superAdminUpdateUser,
} from '@/lib/actions/superadmin';
import { toast } from 'sonner';
import { CandidateStage, JobStatus, Role } from '@prisma/client';

interface SuperAdminCRMProps {
  initialData: {
    counts: Record<string, number>;
    tables: Record<string, any[]>;
  };
}

const TABLE_KEYS = [
  'User',
  'Workspace',
  'Job',
  'Candidate',
  'Interview',
  'Scorecard',
  'WorkspaceMember',
  'Account',
  'Session',
  'Invitation',
  'VerificationToken',
  'ActivityLog',
] as const;

type TableKey = typeof TABLE_KEYS[number];

const STAGE_COLORS: Record<string, string> = {
  APPLIED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  SCREENING: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  INTERVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  OFFER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  HIRED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const JOB_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  DRAFT: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  CLOSED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export function SuperAdminCRM({ initialData }: SuperAdminCRMProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<'overview' | 'workspaces' | 'users' | 'jobs' | 'candidates' | 'interviews' | 'tables' | 'activity'>('overview');
  const [selectedDbTable, setSelectedDbTable] = useState<TableKey>('User');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Inspect Modal
  const [inspectedRow, setInspectedRow] = useState<{ title: string; json: any } | null>(null);

  // Modals for Create
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const [showCreateJob, setShowCreateJob] = useState(false);
  const [newJobData, setNewJobData] = useState({ title: '', department: '', description: '', status: 'OPEN' as JobStatus, workspaceId: '' });

  const [showCreateCandidate, setShowCreateCandidate] = useState(false);
  const [newCandidateData, setNewCandidateData] = useState({ name: '', email: '', jobId: '', stage: 'APPLIED' as CandidateStage });

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', workspaceId: '', role: 'MEMBER' as Role });

  // Modals for Edit
  const [editingWorkspace, setEditingWorkspace] = useState<{ id: string; name: string } | null>(null);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Filtering for current table view
  const currentTableData = useMemo(() => {
    const raw = data.tables[selectedDbTable] || [];
    if (!searchQuery.trim()) return raw;
    const q = searchQuery.toLowerCase();
    return raw.filter((row: any) => 
      JSON.stringify(row).toLowerCase().includes(q)
    );
  }, [data, selectedDbTable, searchQuery]);

  // Refresh data from server
  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      toast.success('Database synchronization complete');
    });
  };

  // ----------------- HANDLERS: CREATE -----------------
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    startTransition(async () => {
      try {
        const res = await superAdminCreateWorkspace(newWorkspaceName);
        if (res.success && res.workspace) {
          toast.success(`Workspace "${res.workspace.name}" created in database`);
          setData(prev => ({
            ...prev,
            counts: { ...prev.counts, workspaces: (prev.counts.workspaces || 0) + 1 },
            tables: { ...prev.tables, Workspace: [res.workspace, ...prev.tables.Workspace] }
          }));
          setNewWorkspaceName('');
          setShowCreateWorkspace(false);
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to create workspace');
        }
      } catch (err: any) {
        toast.error(err.message || 'Error creating workspace');
      }
    });
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobData.title.trim() || !newJobData.workspaceId) {
      toast.error('Job title and workspace are required');
      return;
    }
    startTransition(async () => {
      try {
        const res = await superAdminCreateJob(newJobData);
        if (res.success && res.job) {
          toast.success(`Job "${res.job.title}" created in database`);
          setData(prev => ({
            ...prev,
            counts: { ...prev.counts, jobs: (prev.counts.jobs || 0) + 1 },
            tables: {
              ...prev.tables,
              Job: [
                {
                  ...res.job,
                  workspace: prev.tables.Workspace.find(w => w.id === res.job.workspaceId),
                  _count: { candidates: 0 }
                },
                ...prev.tables.Job
              ]
            }
          }));
          setNewJobData({ title: '', department: '', description: '', status: 'OPEN', workspaceId: '' });
          setShowCreateJob(false);
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to create job');
        }
      } catch (err: any) {
        toast.error(err.message || 'Error creating job');
      }
    });
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateData.name.trim() || !newCandidateData.email.trim() || !newCandidateData.jobId) {
      toast.error('Name, email, and job are required');
      return;
    }
    startTransition(async () => {
      try {
        const res = await superAdminCreateCandidate(newCandidateData);
        if (res.success && res.candidate) {
          toast.success(`Candidate "${res.candidate.name}" added to database`);
          setData(prev => ({
            ...prev,
            counts: { ...prev.counts, candidates: (prev.counts.candidates || 0) + 1 },
            tables: {
              ...prev.tables,
              Candidate: [
                {
                  ...res.candidate,
                  interviews: []
                },
                ...prev.tables.Candidate
              ]
            }
          }));
          setNewCandidateData({ name: '', email: '', jobId: '', stage: 'APPLIED' });
          setShowCreateCandidate(false);
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to add candidate');
        }
      } catch (err: any) {
        toast.error(err.message || 'Error adding candidate');
      }
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    startTransition(async () => {
      try {
        const res = await superAdminCreateUser(newUserData);
        if (res.success && res.user) {
          toast.success(`User "${res.user.email}" registered in database`);
          setData(prev => ({
            ...prev,
            counts: { ...prev.counts, users: (prev.counts.users || 0) + 1 },
            tables: {
              ...prev.tables,
              User: [
                {
                  ...res.user,
                  accounts: [],
                  workspaceMembers: []
                },
                ...prev.tables.User
              ]
            }
          }));
          setNewUserData({ name: '', email: '', password: '', workspaceId: '', role: 'MEMBER' });
          setShowCreateUser(false);
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to create user');
        }
      } catch (err: any) {
        toast.error(err.message || 'Error creating user');
      }
    });
  };

  // ----------------- HANDLERS: UPDATE -----------------
  const handleSaveEditWorkspace = async () => {
    if (!editingWorkspace) return;
    startTransition(async () => {
      try {
        const res = await superAdminUpdateWorkspaceName(editingWorkspace.id, editingWorkspace.name);
        if (res.success && res.workspace) {
          toast.success('Workspace updated in database');
          setData(prev => ({
            ...prev,
            tables: {
              ...prev.tables,
              Workspace: prev.tables.Workspace.map(w => w.id === res.workspace.id ? { ...w, name: res.workspace.name } : w)
            }
          }));
          setEditingWorkspace(null);
          router.refresh();
        }
      } catch (err: any) {
        toast.error(err.message || 'Error updating workspace');
      }
    });
  };

  const handleSaveEditJob = async () => {
    if (!editingJob) return;
    startTransition(async () => {
      try {
        const res = await superAdminUpdateJob(editingJob);
        if (res.success && res.job) {
          toast.success('Job updated in database');
          setData(prev => ({
            ...prev,
            tables: {
              ...prev.tables,
              Job: prev.tables.Job.map(j => j.id === res.job.id ? { ...j, ...res.job } : j)
            }
          }));
          setEditingJob(null);
          router.refresh();
        }
      } catch (err: any) {
        toast.error(err.message || 'Error updating job');
      }
    });
  };

  const handleSaveEditCandidate = async () => {
    if (!editingCandidate) return;
    startTransition(async () => {
      try {
        const res = await superAdminUpdateCandidate(editingCandidate);
        if (res.success && res.candidate) {
          toast.success('Candidate updated in database');
          setData(prev => ({
            ...prev,
            tables: {
              ...prev.tables,
              Candidate: prev.tables.Candidate.map(c => c.id === res.candidate.id ? { ...c, ...res.candidate } : c)
            }
          }));
          setEditingCandidate(null);
          router.refresh();
        }
      } catch (err: any) {
        toast.error(err.message || 'Error updating candidate');
      }
    });
  };

  const handleSaveEditUser = async () => {
    if (!editingUser) return;
    startTransition(async () => {
      try {
        const res = await superAdminUpdateUser(editingUser);
        if (res.success && res.user) {
          toast.success('User updated in database');
          setData(prev => ({
            ...prev,
            tables: {
              ...prev.tables,
              User: prev.tables.User.map(u => u.id === res.user.id ? { ...u, ...res.user } : u)
            }
          }));
          setEditingUser(null);
          router.refresh();
        }
      } catch (err: any) {
        toast.error(err.message || 'Error updating user');
      }
    });
  };

  const handleUpdateStage = async (candidateId: string, newStage: CandidateStage) => {
    startTransition(async () => {
      try {
        const res = await superAdminUpdateCandidateStage(candidateId, newStage);
        if (res.success) {
          toast.success(`Candidate updated to ${newStage}`);
          setData(prev => ({
            ...prev,
            tables: {
              ...prev.tables,
              Candidate: prev.tables.Candidate.map(c => c.id === candidateId ? { ...c, stage: newStage } : c),
            },
          }));
          router.refresh();
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to update stage');
      }
    });
  };

  const handleUpdateJobStatus = async (jobId: string, newStatus: JobStatus) => {
    startTransition(async () => {
      try {
        const res = await superAdminUpdateJobStatus(jobId, newStatus);
        if (res.success) {
          toast.success(`Job status changed to ${newStatus}`);
          setData(prev => ({
            ...prev,
            tables: {
              ...prev.tables,
              Job: prev.tables.Job.map(j => j.id === jobId ? { ...j, status: newStatus } : j),
            },
          }));
          router.refresh();
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to update job status');
      }
    });
  };

  // ----------------- HANDLERS: DELETE -----------------
  const handleDelete = async (model: string, id: string, name?: string) => {
    if (!confirm(`Are you sure you want to permanently delete this ${model} (${name || id}) from the actual database? This will remove all related records!`)) {
      return;
    }
    startTransition(async () => {
      try {
        const res = await superAdminDeleteRecord(model, id);
        if (res.success) {
          toast.success(`${model} permanently deleted from database`);
          setData(prev => ({
            ...prev,
            counts: {
              ...prev.counts,
              [model.toLowerCase() + 's']: Math.max(0, (prev.counts[model.toLowerCase() + 's'] || 1) - 1),
            },
            tables: {
              ...prev.tables,
              [model]: (prev.tables[model] || []).filter((r: any) => r.id !== id),
            },
          }));
          router.refresh();
        } else {
          toast.error(res.error || `Failed to delete ${model}`);
        }
      } catch (err: any) {
        toast.error(err.message || `Error deleting ${model}`);
      }
    });
  };

  // Export JSON
  const handleExportJSON = (tableName: string) => {
    const raw = tableName === 'All' ? data.tables : (data.tables[tableName] || []);
    const blob = new Blob([JSON.stringify(raw, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hiretrack_${tableName.toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${tableName} data`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span>Owner Control Center & CRM</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold">
              Live DB Synced
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Direct real-time create, read, update, and delete access to all 12 PostgreSQL database tables.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isPending}
            className="gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExportJSON(selectedDbTable)}
            className="gap-1.5 text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Table</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExportJSON('All')}
            className="gap-1.5 text-xs font-medium text-primary border-primary/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Export Full DB</span>
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border/60">
        {[
          { id: 'overview', label: 'CRM Overview', icon: Layers },
          { id: 'workspaces', label: `Workspaces (${data.counts.workspaces || 0})`, icon: Building2 },
          { id: 'users', label: `Users (${data.counts.users || 0})`, icon: Users },
          { id: 'jobs', label: `Jobs (${data.counts.jobs || 0})`, icon: Briefcase },
          { id: 'candidates', label: `Candidates (${data.counts.candidates || 0})`, icon: UserCheck },
          { id: 'interviews', label: `Interviews (${data.counts.interviews || 0})`, icon: Calendar },
          { id: 'tables', label: 'All 12 DB Tables', icon: Database, highlight: true },
          { id: 'activity', label: 'Audit Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : tab.highlight
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { label: 'Workspaces', count: data.counts.workspaces, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Platform Users', count: data.counts.users, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Job Postings', count: data.counts.jobs, icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Candidates', count: data.counts.candidates, icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Interviews', count: data.counts.interviews, icon: Calendar, color: 'text-sky-400', bg: 'bg-sky-500/10' },
              { label: 'Audit Logs', count: data.counts.activityLogs, icon: Activity, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                    <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-foreground mt-2">
                    {stat.count || 0}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Create Actions */}
          <div className="p-5 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span>Quick Create in Database</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Button size="sm" onClick={() => setShowCreateWorkspace(true)} className="gap-1.5 text-xs">
                <Building2 className="w-3.5 h-3.5" />
                <span>New Workspace</span>
              </Button>
              <Button size="sm" onClick={() => setShowCreateJob(true)} variant="outline" className="gap-1.5 text-xs">
                <Briefcase className="w-3.5 h-3.5" />
                <span>New Job</span>
              </Button>
              <Button size="sm" onClick={() => setShowCreateCandidate(true)} variant="outline" className="gap-1.5 text-xs">
                <UserCheck className="w-3.5 h-3.5" />
                <span>New Candidate</span>
              </Button>
              <Button size="sm" onClick={() => setShowCreateUser(true)} variant="outline" className="gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5" />
                <span>New User</span>
              </Button>
            </div>
          </div>

          {/* Table Directory Grid */}
          <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">PostgreSQL Tables Live Directory</h3>
              </div>
              <span className="text-xs text-muted-foreground">Click any table to view rows</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {TABLE_KEYS.map((table) => {
                const count = (data.tables[table] || []).length;
                return (
                  <button
                    key={table}
                    onClick={() => {
                      setSelectedDbTable(table);
                      setActiveTab('tables');
                    }}
                    className="p-3 rounded-lg border border-border/60 bg-background/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {table}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-muted-foreground">Rows:</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-card border border-border/80">
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKSPACES CRM */}
      {activeTab === 'workspaces' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button size="sm" onClick={() => setShowCreateWorkspace(true)} className="gap-1.5 text-xs font-medium">
              <Plus className="w-3.5 h-3.5" />
              <span>New Workspace</span>
            </Button>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Workspace Name</th>
                  <th className="px-4 py-3">Workspace ID</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Jobs</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {data.tables.Workspace.filter((w) =>
                  !searchQuery || w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.id.includes(searchQuery)
                ).map((w: any) => (
                  <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>{w.name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{w.id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {w._count?.members || w.members?.length || 0} members
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-card border border-border font-medium">
                        {w._count?.jobs || 0} jobs
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 gap-1"
                        onClick={() => setEditingWorkspace({ id: w.id, name: w.name })}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 text-red-400 hover:text-red-300 hover:border-red-500/50"
                        onClick={() => handleDelete('Workspace', w.id, w.name)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USERS CRM */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button size="sm" onClick={() => setShowCreateUser(true)} className="gap-1.5 text-xs font-medium">
              <Plus className="w-3.5 h-3.5" />
              <span>New User</span>
            </Button>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Auth Type / Provider</th>
                  <th className="px-4 py-3">Workspaces & Roles</th>
                  <th className="px-4 py-3">Registered At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {data.tables.User.filter((u) =>
                  !searchQuery ||
                  (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((u: any) => {
                  const providers = (u.accounts || []).map((a: any) => a.provider);
                  const authLabel = providers.length > 0 ? providers.join(', ') : 'Password / Credentials';

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold flex items-center gap-2">
                        {u.image ? (
                          <img src={u.image} alt={u.name || ''} className="w-6 h-6 rounded-full border border-border" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                            {(u.name || u.email || 'U').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span>{u.name || 'Anonymous User'}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-medium capitalize">
                          {authLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(u.workspaceMembers || []).map((m: any) => (
                            <span key={m.id} className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">
                              {m.workspace?.name}: <strong>{m.role}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2 gap-1"
                          onClick={() => setEditingUser({ id: u.id, name: u.name || '', email: u.email })}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2 text-red-400 hover:text-red-300 hover:border-red-500/50"
                          onClick={() => handleDelete('User', u.id, u.email)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: JOBS CRM */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button size="sm" onClick={() => setShowCreateJob(true)} className="gap-1.5 text-xs font-medium">
              <Plus className="w-3.5 h-3.5" />
              <span>New Job</span>
            </Button>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Job Title</th>
                  <th className="px-4 py-3">Workspace</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Candidates</th>
                  <th className="px-4 py-3">Status (Live Toggle)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {data.tables.Job.filter((j) =>
                  !searchQuery ||
                  j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (j.department && j.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (j.workspace?.name && j.workspace.name.toLowerCase().includes(searchQuery.toLowerCase()))
                ).map((j: any) => (
                  <tr key={j.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">{j.title}</td>
                    <td className="px-4 py-3 text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span>{j.workspace?.name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{j.department || '—'}</td>
                    <td className="px-4 py-3 font-medium">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {j._count?.candidates || 0} candidates
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={j.status}
                        onChange={(e) => handleUpdateJobStatus(j.id, e.target.value as JobStatus)}
                        className={`text-xs px-2.5 py-1 rounded-md border font-semibold cursor-pointer outline-none ${
                          JOB_STATUS_COLORS[j.status] || ''
                        }`}
                      >
                        <option value="OPEN" className="bg-card text-foreground">OPEN</option>
                        <option value="DRAFT" className="bg-card text-foreground">DRAFT</option>
                        <option value="CLOSED" className="bg-card text-foreground">CLOSED</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 gap-1"
                        onClick={() => setEditingJob(j)}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 text-red-400 hover:text-red-300 hover:border-red-500/50"
                        onClick={() => handleDelete('Job', j.id, j.title)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CANDIDATES CRM */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button size="sm" onClick={() => setShowCreateCandidate(true)} className="gap-1.5 text-xs font-medium">
              <Plus className="w-3.5 h-3.5" />
              <span>New Candidate</span>
            </Button>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Applied Job & Workspace</th>
                  <th className="px-4 py-3">Interviews</th>
                  <th className="px-4 py-3">Stage (Live Updater)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {data.tables.Candidate.filter((c) =>
                  !searchQuery ||
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (c.job?.title && c.job.title.toLowerCase().includes(searchQuery.toLowerCase()))
                ).map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">{c.email}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{c.job?.title}</div>
                      <div className="text-[10px] text-muted-foreground">{c.job?.workspace?.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-card border border-border font-medium">
                        {c.interviews?.length || 0} scheduled
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={c.stage}
                        onChange={(e) => handleUpdateStage(c.id, e.target.value as CandidateStage)}
                        className={`text-xs px-2.5 py-1 rounded-md border font-semibold cursor-pointer outline-none ${
                          STAGE_COLORS[c.stage] || ''
                        }`}
                      >
                        <option value="APPLIED" className="bg-card text-foreground">APPLIED</option>
                        <option value="SCREENING" className="bg-card text-foreground">SCREENING</option>
                        <option value="INTERVIEW" className="bg-card text-foreground">INTERVIEW</option>
                        <option value="OFFER" className="bg-card text-foreground">OFFER</option>
                        <option value="HIRED" className="bg-card text-foreground">HIRED</option>
                        <option value="REJECTED" className="bg-card text-foreground">REJECTED</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 gap-1"
                        onClick={() => setEditingCandidate(c)}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 text-red-400 hover:text-red-300 hover:border-red-500/50"
                        onClick={() => handleDelete('Candidate', c.id, c.name)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: INTERVIEWS & SCORECARDS CRM */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">Interviews & Performance Scorecards</h3>
            <span className="text-xs text-muted-foreground">{data.tables.Interview.length} Interviews Scheduled</span>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Interviewer</th>
                  <th className="px-4 py-3">Scheduled At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Scorecard Ratings</th>
                  <th className="px-4 py-3">Interviewer Notes</th>
                  <th className="px-4 py-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {data.tables.Interview.map((i: any) => {
                  const sc = i.scorecard;
                  return (
                    <tr key={i.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold">{i.candidate?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.interviewer?.name || i.interviewer?.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(i.scheduledAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
                          {i.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sc ? (
                          <div className="space-y-0.5">
                            <span className="text-emerald-400 font-bold">Overall: {sc.overallRating}/5</span>
                            <div className="text-[10px] text-muted-foreground">
                              T: {sc.technicalSkill} | C: {sc.cultureFit} | Comm: {sc.communication}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">No scorecard</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">
                        {sc?.notes || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 text-red-400 hover:text-red-300"
                          onClick={() => handleDelete('Interview', i.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: ALL 12 DATABASE TABLES EXPLORER */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">PostgreSQL Database Grid Explorer</h3>
                <p className="text-xs text-muted-foreground">
                  View, filter, delete, or inspect any record from all 12 tables stored in PostgreSQL.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-medium"
              onClick={() => handleExportJSON(selectedDbTable)}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export {selectedDbTable}</span>
            </Button>
          </div>

          {/* Table Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {TABLE_KEYS.map((table) => {
              const isSelected = selectedDbTable === table;
              const count = (data.tables[table] || []).length;
              return (
                <button
                  key={table}
                  onClick={() => setSelectedDbTable(table)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-foreground text-background font-bold shadow'
                      : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <span>{table}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-background/20 text-background' : 'bg-muted text-foreground'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Table */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search across ${selectedDbTable} records...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Showing {currentTableData.length} records in <strong className="text-foreground">{selectedDbTable}</strong>
            </div>
          </div>

          {/* Dynamic Data Grid */}
          <div className="rounded-xl border border-border/70 bg-card/60 overflow-x-auto">
            {currentTableData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                No records in table <strong>{selectedDbTable}</strong>.
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    {Object.keys(currentTableData[0] || {}).map((col) => (
                      <th key={col} className="px-4 py-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-foreground">
                  {currentTableData.map((row: any, idx: number) => (
                    <tr key={row.id || idx} className="hover:bg-muted/30 transition-colors">
                      {Object.entries(row).map(([key, val]: [string, any], cIdx) => {
                        let displayVal = '—';
                        if (val !== null && val !== undefined) {
                          if (typeof val === 'object') {
                            displayVal = Array.isArray(val) ? `[${val.length} items]` : '{...}';
                          } else {
                            displayVal = String(val);
                          }
                        }

                        return (
                          <td key={cIdx} className="px-4 py-3 font-mono text-[11px] max-w-xs truncate">
                            {displayVal}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 gap-1"
                          onClick={() => setInspectedRow({ title: `${selectedDbTable} #${row.id || idx}`, json: row })}
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span>Inspect</span>
                        </Button>
                        {row.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2 text-red-400 hover:text-red-300"
                            onClick={() => handleDelete(selectedDbTable, row.id, row.name || row.email || row.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">Platform Activity & Audit History</h3>
            <span className="text-xs text-muted-foreground">{data.tables.ActivityLog.length} Audit Records</span>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Workspace</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {data.tables.ActivityLog.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium">{log.workspace?.name || log.workspaceId}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{log.user?.name || log.user?.email || 'System'}</td>
                    <td className="px-4 py-3 font-normal text-foreground">{log.details}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2 text-red-400 hover:text-red-300"
                        onClick={() => handleDelete('ActivityLog', log.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- CREATE MODALS -------------------- */}

      {/* CREATE WORKSPACE MODAL */}
      {showCreateWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleCreateWorkspace} className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Create New Workspace</span>
              </h3>
              <button type="button" onClick={() => setShowCreateWorkspace(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Workspace Name</label>
              <Input
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Innovations"
                required
                className="text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-card">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateWorkspace(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={isPending}>Create Workspace</Button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE JOB MODAL */}
      {showCreateJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleCreateJob} className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <span>Create New Job</span>
              </h3>
              <button type="button" onClick={() => setShowCreateJob(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Job Title *</label>
                <Input
                  value={newJobData.title}
                  onChange={(e) => setNewJobData({ ...newJobData, title: e.target.value })}
                  placeholder="e.g. Senior Backend Engineer"
                  required
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Target Workspace *</label>
                <select
                  value={newJobData.workspaceId}
                  onChange={(e) => setNewJobData({ ...newJobData, workspaceId: e.target.value })}
                  required
                  className="w-full text-xs px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none"
                >
                  <option value="">Select a Workspace...</option>
                  {data.tables.Workspace.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Department</label>
                <Input
                  value={newJobData.department}
                  onChange={(e) => setNewJobData({ ...newJobData, department: e.target.value })}
                  placeholder="e.g. Product Engineering"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select
                  value={newJobData.status}
                  onChange={(e) => setNewJobData({ ...newJobData, status: e.target.value as JobStatus })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-card">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateJob(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={isPending}>Create Job</Button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE CANDIDATE MODAL */}
      {showCreateCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleCreateCandidate} className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <span>Add Candidate to Pipeline</span>
              </h3>
              <button type="button" onClick={() => setShowCreateCandidate(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Candidate Full Name *</label>
                <Input
                  value={newCandidateData.name}
                  onChange={(e) => setNewCandidateData({ ...newCandidateData, name: e.target.value })}
                  placeholder="e.g. Maya Lin"
                  required
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email Address *</label>
                <Input
                  type="email"
                  value={newCandidateData.email}
                  onChange={(e) => setNewCandidateData({ ...newCandidateData, email: e.target.value })}
                  placeholder="e.g. maya@example.com"
                  required
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Select Job *</label>
                <select
                  value={newCandidateData.jobId}
                  onChange={(e) => setNewCandidateData({ ...newCandidateData, jobId: e.target.value })}
                  required
                  className="w-full text-xs px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none"
                >
                  <option value="">Select a Job...</option>
                  {data.tables.Job.map(j => (
                    <option key={j.id} value={j.id}>{j.title} ({j.workspace?.name || 'Workspace'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Initial Stage</label>
                <select
                  value={newCandidateData.stage}
                  onChange={(e) => setNewCandidateData({ ...newCandidateData, stage: e.target.value as CandidateStage })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none"
                >
                  <option value="APPLIED">APPLIED</option>
                  <option value="SCREENING">SCREENING</option>
                  <option value="INTERVIEW">INTERVIEW</option>
                  <option value="OFFER">OFFER</option>
                  <option value="HIRED">HIRED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-card">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateCandidate(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={isPending}>Save Candidate</Button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleCreateUser} className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Register New User</span>
              </h3>
              <button type="button" onClick={() => setShowCreateUser(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <Input
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. John Recruiter"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email *</label>
                <Input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="e.g. john@acme.com"
                  required
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Password (Optional for OAuth users)</label>
                <Input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Assign to Workspace (Optional)</label>
                <select
                  value={newUserData.workspaceId}
                  onChange={(e) => setNewUserData({ ...newUserData, workspaceId: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none"
                >
                  <option value="">No workspace assignment</option>
                  {data.tables.Workspace.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-card">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateUser(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={isPending}>Register User</Button>
            </div>
          </form>
        </div>
      )}

      {/* -------------------- EDIT MODALS -------------------- */}

      {/* EDIT WORKSPACE MODAL */}
      {editingWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Edit Workspace Name</h3>
              <button onClick={() => setEditingWorkspace(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Workspace Name</label>
              <Input
                value={editingWorkspace.name}
                onChange={(e) => setEditingWorkspace({ ...editingWorkspace, name: e.target.value })}
                className="text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-card">
              <Button variant="outline" size="sm" onClick={() => setEditingWorkspace(null)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveEditWorkspace} disabled={isPending}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT JOB MODAL */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Edit Job Details</h3>
              <button onClick={() => setEditingJob(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Job Title</label>
                <Input
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Department</label>
                <Input
                  value={editingJob.department || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select
                  value={editingJob.status}
                  onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as JobStatus })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-card">
              <Button variant="outline" size="sm" onClick={() => setEditingJob(null)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveEditJob} disabled={isPending}>Update Job</Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CANDIDATE MODAL */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Edit Candidate</h3>
              <button onClick={() => setEditingCandidate(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Candidate Name</label>
                <Input
                  value={editingCandidate.name}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Candidate Email</label>
                <Input
                  value={editingCandidate.email}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, email: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Stage</label>
                <select
                  value={editingCandidate.stage}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, stage: e.target.value as CandidateStage })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-border bg-background text-foreground outline-none"
                >
                  <option value="APPLIED">APPLIED</option>
                  <option value="SCREENING">SCREENING</option>
                  <option value="INTERVIEW">INTERVIEW</option>
                  <option value="OFFER">OFFER</option>
                  <option value="HIRED">HIRED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-card">
              <Button variant="outline" size="sm" onClick={() => setEditingCandidate(null)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveEditCandidate} disabled={isPending}>Update Candidate</Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Edit User Profile</h3>
              <button onClick={() => setEditingUser(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <Input
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-card">
              <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveEditUser} disabled={isPending}>Save User</Button>
            </div>
          </div>
        </div>
      )}

      {/* RAW JSON INSPECT MODAL */}
      {inspectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">{inspectedRow.title}</h3>
              </div>
              <button
                onClick={() => setInspectedRow(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-background/50">
              <pre className="text-xs font-mono text-emerald-400 bg-black/70 p-4 rounded-lg overflow-x-auto border border-border/80">
                {JSON.stringify(inspectedRow.json, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-end px-5 py-3 border-t border-border bg-card">
              <Button size="sm" onClick={() => setInspectedRow(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
