'use client';

import { useState, useTransition, useOptimistic, useEffect, useMemo } from 'react';
import { CandidateStage } from '@prisma/client';
import { updateCandidateStage, bulkUpdateCandidateStage } from '@/lib/actions/candidates';
import { 
  CheckCircle2, 
  ArrowRight, 
  XCircle, 
  Calendar, 
  ExternalLink, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  LayoutList, 
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Briefcase,
  UserCheck,
  RotateCcw,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export interface WorkstationCandidate {
  id: string;
  name: string;
  email: string;
  resumeUrl: string | null;
  stage: CandidateStage;
  jobId: string;
  createdAt: Date | string;
  job?: {
    id: string;
    title: string;
  };
  interviews?: Array<{
    id: string;
    scheduledAt: Date | string;
    status: string;
    interviewer?: { name: string | null };
    scorecard?: { overallRating: number } | null;
  }>;
}

interface CandidateWorkstationProps {
  initialCandidates: WorkstationCandidate[];
  jobs: Array<{ id: string; title: string }>;
  selectedJobId?: string;
  initialSearch?: string;
}

const STAGE_CONFIG: Record<CandidateStage, { label: string; color: string; bg: string; border: string; step: number }> = {
  APPLIED: { label: 'Applied', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', step: 1 },
  SCREENING: { label: 'Screening', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', step: 2 },
  INTERVIEW: { label: 'Interview', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', step: 3 },
  OFFER: { label: 'Offer', color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', step: 4 },
  HIRED: { label: 'Hired', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', step: 5 },
  REJECTED: { label: 'Rejected', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', step: 0 },
};

const PROGRESSION_STAGES: CandidateStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'];

const QUEUE_PAGE_SIZE = 5;
const TABLE_PAGE_SIZE = 7;

export function CandidateWorkstation({
  initialCandidates,
  jobs,
  selectedJobId = '',
  initialSearch = '',
}: CandidateWorkstationProps) {
  const [candidates, setCandidates] = useState<WorkstationCandidate[]>(initialCandidates);
  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');
  const [jobFilter, setJobFilter] = useState<string>(selectedJobId);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [viewMode, setViewMode] = useState<'split' | 'table'>('split');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    initialCandidates[0]?.id || null
  );
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [queuePage, setQueuePage] = useState<number>(1);
  const [tablePage, setTablePage] = useState<number>(1);
  const [, startTransition] = useTransition();

  // Keep internal list updated when initialCandidates change
  useEffect(() => {
    setCandidates(initialCandidates);
    if (initialCandidates.length > 0 && !selectedCandidateId) {
      setSelectedCandidateId(initialCandidates[0].id);
    }
  }, [initialCandidates]);

  // Reset page when filters change
  useEffect(() => {
    setQueuePage(1);
    setTablePage(1);
  }, [activeStageFilter, jobFilter, searchQuery]);

  // Optimistic UI state
  const [optimisticCandidates, setOptimisticCandidates] = useOptimistic(
    candidates,
    (state: WorkstationCandidate[], update: { ids: string[]; newStage: CandidateStage }) => {
      return state.map((c) =>
        update.ids.includes(c.id) ? { ...c, stage: update.newStage } : c
      );
    }
  );

  // Compute counts per stage
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: optimisticCandidates.length };
    PROGRESSION_STAGES.forEach((s) => (counts[s] = 0));
    counts['REJECTED'] = 0;

    optimisticCandidates.forEach((c) => {
      if (counts[c.stage] !== undefined) {
        counts[c.stage] += 1;
      }
    });
    return counts;
  }, [optimisticCandidates]);

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return optimisticCandidates.filter((c) => {
      if (activeStageFilter !== 'ALL' && c.stage !== activeStageFilter) {
        return false;
      }
      if (jobFilter && c.jobId !== jobFilter) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }, [optimisticCandidates, activeStageFilter, jobFilter, searchQuery]);

  // Paginated Queue for Split Mode (No vertical scrolling needed!)
  const totalQueuePages = Math.max(1, Math.ceil(filteredCandidates.length / QUEUE_PAGE_SIZE));
  const paginatedQueueCandidates = useMemo(() => {
    const start = (queuePage - 1) * QUEUE_PAGE_SIZE;
    return filteredCandidates.slice(start, start + QUEUE_PAGE_SIZE);
  }, [filteredCandidates, queuePage]);

  // Paginated Table for Matrix Mode
  const totalTablePages = Math.max(1, Math.ceil(filteredCandidates.length / TABLE_PAGE_SIZE));
  const paginatedTableCandidates = useMemo(() => {
    const start = (tablePage - 1) * TABLE_PAGE_SIZE;
    return filteredCandidates.slice(start, start + TABLE_PAGE_SIZE);
  }, [filteredCandidates, tablePage]);

  // Active selected candidate for review split pane
  const activeCandidate = useMemo(() => {
    return (
      filteredCandidates.find((c) => c.id === selectedCandidateId) ||
      paginatedQueueCandidates[0] ||
      filteredCandidates[0] ||
      null
    );
  }, [filteredCandidates, selectedCandidateId, paginatedQueueCandidates]);

  // Update a single candidate's stage
  const handleStageChange = (candidateId: string, newStage: CandidateStage) => {
    startTransition(async () => {
      setOptimisticCandidates({ ids: [candidateId], newStage });
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
      );
      await updateCandidateStage(candidateId, newStage);
    });
  };

  // Advance to next progressive stage
  const handleAdvanceStage = (candidate: WorkstationCandidate) => {
    const currentIndex = PROGRESSION_STAGES.indexOf(candidate.stage);
    if (currentIndex < PROGRESSION_STAGES.length - 1) {
      const nextStage = PROGRESSION_STAGES[currentIndex + 1];
      handleStageChange(candidate.id, nextStage);
    }
  };

  // Bulk update stages
  const handleBulkStageChange = (newStage: CandidateStage) => {
    if (!selectedForBulk.length) return;
    const ids = [...selectedForBulk];
    startTransition(async () => {
      setOptimisticCandidates({ ids, newStage });
      setCandidates((prev) =>
        prev.map((c) => (ids.includes(c.id) ? { ...c, stage: newStage } : c))
      );
      setSelectedForBulk([]);
      await bulkUpdateCandidateStage(ids, newStage);
    });
  };

  // Keyboard navigation shortcuts [A] for advance, [R] for reject, Up/Down arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (!activeCandidate) return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleAdvanceStage(activeCandidate);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleStageChange(activeCandidate.id, 'REJECTED');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = paginatedQueueCandidates.findIndex((c) => c.id === activeCandidate.id);
        if (currentIndex < paginatedQueueCandidates.length - 1) {
          setSelectedCandidateId(paginatedQueueCandidates[currentIndex + 1].id);
        } else if (queuePage < totalQueuePages) {
          setQueuePage((p) => p + 1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = paginatedQueueCandidates.findIndex((c) => c.id === activeCandidate.id);
        if (currentIndex > 0) {
          setSelectedCandidateId(paginatedQueueCandidates[currentIndex - 1].id);
        } else if (queuePage > 1) {
          setQueuePage((p) => p - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCandidate, paginatedQueueCandidates, queuePage, totalQueuePages]);

  // Format date helper
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const nextStageForActive = useMemo(() => {
    if (!activeCandidate) return null;
    const idx = PROGRESSION_STAGES.indexOf(activeCandidate.stage);
    if (idx >= 0 && idx < PROGRESSION_STAGES.length - 1) {
      return PROGRESSION_STAGES[idx + 1];
    }
    return null;
  }, [activeCandidate]);

  return (
    <div className="flex flex-col h-full space-y-3 overflow-hidden select-none">
      {/* Top Header: Title, Controls, and View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Candidate Review Workstation
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Sparkles className="h-3 w-3" /> High-Velocity ATS
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Zero-scroll candidate triage, 1-click stage progression, and structured evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-muted rounded-lg border border-border">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'split'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Split Review Cockpit"
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cockpit</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table Data Matrix"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Matrix</span>
            </button>
          </div>

          <Link href="/dashboard/candidates/new">
            <Button size="sm" className="h-8 text-xs font-semibold shadow-xs">
              Add Candidate
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Milestone Funnel Bar */}
      <div className="shrink-0 overflow-x-auto no-scrollbar pb-0.5">
        <div className="flex items-center gap-1.5 min-w-max p-1 bg-muted/40 rounded-xl border border-border">
          <button
            onClick={() => setActiveStageFilter('ALL')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeStageFilter === 'ALL'
                ? 'bg-background text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <span>All Candidates</span>
            <span className="px-1.5 py-0.2 rounded-full bg-muted-foreground/15 text-[11px] font-bold">
              {stageCounts['ALL'] || 0}
            </span>
          </button>

          <span className="text-border">|</span>

          {PROGRESSION_STAGES.map((stg, i) => {
            const config = STAGE_CONFIG[stg];
            const isSelected = activeStageFilter === stg;
            const count = stageCounts[stg] || 0;

            return (
              <div key={stg} className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveStageFilter(stg)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? `${config.bg} ${config.color} font-bold border ${config.border} shadow-xs`
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
                  <span>{config.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                      isSelected
                        ? 'bg-current/15'
                        : 'bg-muted-foreground/15 text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </button>
                {i < PROGRESSION_STAGES.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            );
          })}

          <span className="text-border">|</span>

          <button
            onClick={() => setActiveStageFilter('REJECTED')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeStageFilter === 'REJECTED'
                ? 'bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
            <span>Rejected</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-500 text-[11px] font-bold">
              {stageCounts['REJECTED'] || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Job Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="h-8 px-2.5 text-xs rounded-md bg-muted/30 border border-border text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Jobs ({jobs.length})</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        {(activeStageFilter !== 'ALL' || jobFilter || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveStageFilter('ALL');
              setJobFilter('');
              setSearchQuery('');
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Filters
          </Button>
        )}

        <div className="ml-auto text-xs text-muted-foreground font-medium">
          Total: <span className="text-foreground font-bold">{filteredCandidates.length}</span> candidates
        </div>
      </div>

      {/* Main Content Area - Strictly Zero Scrollbar */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'split' ? (
          /* Split Review Cockpit */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
            {/* Left Column: Candidate Queue with Pagination (NO SCROLL!) */}
            <div className="lg:col-span-5 h-full flex flex-col bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
              <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground font-semibold shrink-0">
                <span>CANDIDATE QUEUE</span>
                <span className="text-[11px] font-normal">
                  Hotkeys: <kbd className="px-1 py-0.5 bg-background border rounded font-mono">[A]</kbd>{' '}
                  <kbd className="px-1 py-0.5 bg-background border rounded font-mono">[R]</kbd>
                </span>
              </div>

              {/* Candidates items list */}
              <div className="flex-1 divide-y divide-border/60 overflow-hidden flex flex-col justify-start">
                {paginatedQueueCandidates.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground space-y-2 my-auto">
                    <p className="text-sm font-medium">No candidates match this filter.</p>
                    <p className="text-xs">Try selecting a different stage or clearing search.</p>
                  </div>
                ) : (
                  paginatedQueueCandidates.map((candidate) => {
                    const isSelected = activeCandidate?.id === candidate.id;
                    const stageConfig = STAGE_CONFIG[candidate.stage];
                    const initials = candidate.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={candidate.id}
                        onClick={() => setSelectedCandidateId(candidate.id)}
                        className={`p-3 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-primary/10 border-l-4 border-l-primary'
                            : 'hover:bg-muted/40 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs shrink-0 text-foreground border border-border">
                            {initials}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-semibold text-xs text-foreground truncate flex items-center gap-1.5">
                              {candidate.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {candidate.email}
                            </div>
                            {candidate.job && (
                              <div className="text-[10px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                                <Briefcase className="h-3 w-3" />
                                <span className="truncate">{candidate.job.title}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${stageConfig.bg} ${stageConfig.color} border ${stageConfig.border}`}
                          >
                            {stageConfig.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {formatDate(candidate.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Queue Pagination Footer (Guarantees zero vertical scroll) */}
              <div className="p-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground shrink-0">
                <span className="text-[11px]">
                  Page <span className="font-bold text-foreground">{queuePage}</span> of {totalQueuePages} ({filteredCandidates.length})
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={queuePage <= 1}
                    onClick={() => setQueuePage((p) => Math.max(1, p - 1))}
                    title="Previous page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={queuePage >= totalQueuePages}
                    onClick={() => setQueuePage((p) => Math.min(totalQueuePages, p + 1))}
                    title="Next page"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Candidate Evaluation & Stage Stepper Station (100% Zero-Scroll) */}
            <div className="lg:col-span-7 h-full flex flex-col bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
              {activeCandidate ? (
                <div className="flex flex-col h-full overflow-hidden justify-between">
                  {/* Candidate Header Banner */}
                  <div className="p-4 border-b border-border bg-gradient-to-r from-muted/30 to-background flex items-center justify-between gap-3 shrink-0">
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-foreground truncate">
                          {activeCandidate.name}
                        </h2>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            STAGE_CONFIG[activeCandidate.stage].bg
                          } ${STAGE_CONFIG[activeCandidate.stage].color} border ${
                            STAGE_CONFIG[activeCandidate.stage].border
                          }`}
                        >
                          {STAGE_CONFIG[activeCandidate.stage].label}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 truncate">
                        <span>{activeCandidate.email}</span>
                        {activeCandidate.job && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-foreground">{activeCandidate.job.title}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Applied {formatDate(activeCandidate.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/dashboard/candidates/${activeCandidate.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                          <span>Full Profile</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Flagship Feature: 1-Click Milestone Stage Stepper */}
                  <div className="p-4 border-b border-border bg-card space-y-2.5 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Stage Milestone Progression
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Click any milestone to move directly
                      </span>
                    </div>

                    {/* Progression Visual Bar */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {PROGRESSION_STAGES.map((stg) => {
                        const isCurrent = activeCandidate.stage === stg;
                        const isPast =
                          activeCandidate.stage !== 'REJECTED' &&
                          STAGE_CONFIG[activeCandidate.stage].step > STAGE_CONFIG[stg].step;
                        const config = STAGE_CONFIG[stg];

                        return (
                          <button
                            key={stg}
                            onClick={() => handleStageChange(activeCandidate.id, stg)}
                            className={`p-2 rounded-xl text-center border transition-all text-xs font-semibold flex flex-col items-center gap-1 ${
                              isCurrent
                                ? `${config.bg} ${config.color} border-current ring-2 ring-current/20 shadow-xs font-bold`
                                : isPast
                                ? 'bg-muted/60 text-foreground border-border hover:bg-muted'
                                : 'bg-muted/20 text-muted-foreground border-border/60 hover:bg-muted/40'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {isPast ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : isCurrent ? (
                                <span className="h-2 w-2 rounded-full bg-current animate-ping" />
                              ) : null}
                              <span className="truncate">{config.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                      <div className="flex items-center gap-2">
                        {nextStageForActive ? (
                          <Button
                            size="sm"
                            onClick={() => handleAdvanceStage(activeCandidate)}
                            className="h-8 text-xs font-semibold gap-1.5 shadow-sm bg-primary hover:bg-primary/90"
                          >
                            <span>Advance to {STAGE_CONFIG[nextStageForActive].label}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                            <kbd className="ml-1 px-1 py-0.2 rounded bg-primary-foreground/20 text-[10px] font-mono">
                              A
                            </kbd>
                          </Button>
                        ) : activeCandidate.stage === 'HIRED' ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            <UserCheck className="h-4 w-4" /> Candidate Hired!
                          </div>
                        ) : null}

                        {activeCandidate.stage !== 'REJECTED' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStageChange(activeCandidate.id, 'REJECTED')}
                            className="h-8 text-xs font-semibold text-rose-500 border-rose-500/30 hover:bg-rose-500/10 gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                            <kbd className="ml-1 px-1 py-0.2 rounded bg-rose-500/10 text-[10px] font-mono">
                              R
                            </kbd>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStageChange(activeCandidate.id, 'APPLIED')}
                            className="h-8 text-xs font-semibold text-foreground gap-1.5"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Restore to Applied</span>
                          </Button>
                        )}
                      </div>

                      {activeCandidate.resumeUrl && (
                        <a
                          href={activeCandidate.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <span>View Resume PDF</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Context Cards: Compact side-by-side or stacked without overflowing */}
                  <div className="p-4 flex-1 flex flex-col justify-between overflow-hidden gap-3">
                    {/* Interview Feed */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Interviews & Feedback
                        </h3>
                        <Link href={`/dashboard/candidates/${activeCandidate.id}`}>
                          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-primary">
                            + Schedule New
                          </Button>
                        </Link>
                      </div>

                      {activeCandidate.interviews && activeCandidate.interviews.length > 0 ? (
                        <div className="space-y-1.5">
                          {activeCandidate.interviews.slice(0, 2).map((intv) => (
                            <div
                              key={intv.id}
                              className="p-2.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="font-semibold text-foreground">
                                  With {intv.interviewer?.name || 'Assigned Interviewer'}
                                </div>
                                <div className="text-muted-foreground text-[11px]">
                                  {new Date(intv.scheduledAt).toLocaleString()}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant={intv.status === 'COMPLETED' ? 'default' : 'outline'}>
                                  {intv.status}
                                </Badge>
                                {intv.scorecard && (
                                  <span className="flex items-center gap-1 font-bold text-amber-500 text-xs">
                                    <Star className="h-3 w-3 fill-current" />
                                    {intv.scorecard.overallRating}/5
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground space-y-1">
                          <p>No interviews scheduled for this candidate yet.</p>
                          <Link href={`/dashboard/candidates/${activeCandidate.id}`}>
                            <Button size="sm" variant="outline" className="h-6 text-[11px]">
                              Schedule First Round
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Recruiter Guidance */}
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs space-y-0.5">
                      <div className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        Next Recommended Step
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {activeCandidate.stage === 'APPLIED' &&
                          'Review resume profile and advance to Screening if qualifications align.'}
                        {activeCandidate.stage === 'SCREENING' &&
                          'Complete recruiter phone screen and coordinate interview panels.'}
                        {activeCandidate.stage === 'INTERVIEW' &&
                          'Gather interview scorecards from hiring team before extending an offer.'}
                        {activeCandidate.stage === 'OFFER' &&
                          'Draft offer letter and prepare compensation package discussion.'}
                        {activeCandidate.stage === 'HIRED' &&
                          'Candidate successfully accepted! Proceed with workspace onboarding.'}
                        {activeCandidate.stage === 'REJECTED' &&
                          'Candidate marked as rejected. You can restore them anytime.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                  <UserCheck className="h-10 w-10 text-muted-foreground/40 mb-2" />
                  <h3 className="font-bold text-sm text-foreground">Select a candidate to review</h3>
                  <p className="text-xs max-w-sm mt-1">
                    Click any candidate on the left queue or use arrow keys to view live details.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Table Data Matrix with Pagination */
          <div className="h-full flex flex-col bg-card rounded-2xl border border-border overflow-hidden relative shadow-xs">
            <div className="flex-1 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border sticky top-0 z-10">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedTableCandidates.length > 0 &&
                          selectedForBulk.length === paginatedTableCandidates.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedForBulk(paginatedTableCandidates.map((c) => c.id));
                          } else {
                            setSelectedForBulk([]);
                          }
                        }}
                        className="rounded border-border"
                      />
                    </th>
                    <th className="p-3 font-semibold text-muted-foreground">CANDIDATE</th>
                    <th className="p-3 font-semibold text-muted-foreground">JOB ROLE</th>
                    <th className="p-3 font-semibold text-muted-foreground">CURRENT STAGE</th>
                    <th className="p-3 font-semibold text-muted-foreground">APPLIED</th>
                    <th className="p-3 font-semibold text-muted-foreground text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedTableCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No candidates found.
                      </td>
                    </tr>
                  ) : (
                    paginatedTableCandidates.map((candidate) => {
                      const isChecked = selectedForBulk.includes(candidate.id);
                      const config = STAGE_CONFIG[candidate.stage];

                      return (
                        <tr
                          key={candidate.id}
                          className={`hover:bg-muted/30 transition-colors ${
                            isChecked ? 'bg-primary/5' : ''
                          }`}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedForBulk((prev) => [...prev, candidate.id]);
                                } else {
                                  setSelectedForBulk((prev) =>
                                    prev.filter((id) => id !== candidate.id)
                                  );
                                }
                              }}
                              className="rounded border-border"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-foreground">{candidate.name}</div>
                            <div className="text-[11px] text-muted-foreground">{candidate.email}</div>
                          </td>
                          <td className="p-3 font-medium text-foreground">
                            {candidate.job?.title || 'General Pipeline'}
                          </td>
                          <td className="p-3">
                            {/* Inline Stage Dropdown */}
                            <select
                              value={candidate.stage}
                              onChange={(e) =>
                                handleStageChange(candidate.id, e.target.value as CandidateStage)
                              }
                              className={`text-[11px] font-bold px-2 py-1 rounded-md border ${config.bg} ${config.color} ${config.border} focus:outline-none`}
                            >
                              {PROGRESSION_STAGES.map((s) => (
                                <option key={s} value={s}>
                                  {STAGE_CONFIG[s].label}
                                </option>
                              ))}
                              <option value="REJECTED">Rejected</option>
                            </select>
                          </td>
                          <td className="p-3 text-muted-foreground text-[11px]">
                            {formatDate(candidate.createdAt)}
                          </td>
                          <td className="p-3 text-right">
                            <Link href={`/dashboard/candidates/${candidate.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                Review
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer */}
            <div className="p-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground shrink-0">
              <span className="text-[11px]">
                Showing page <span className="font-bold text-foreground">{tablePage}</span> of {totalTablePages} ({filteredCandidates.length} total)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={tablePage <= 1}
                  onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                  title="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={tablePage >= totalTablePages}
                  onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                  title="Next page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Floating Bulk Action Bar */}
            {selectedForBulk.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950 text-white dark:bg-card dark:text-foreground px-4 py-2 rounded-2xl shadow-2xl border border-zinc-800 flex items-center gap-3 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <span className="text-xs font-semibold text-zinc-300">
                  {selectedForBulk.length} selected
                </span>
                <span className="text-zinc-600">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400">Move to:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkStageChange(e.target.value as CandidateStage);
                      }
                    }}
                    defaultValue=""
                    className="h-7 px-2 text-xs rounded-md bg-zinc-900 border border-zinc-700 text-white font-medium focus:outline-none"
                  >
                    <option value="" disabled>
                      Select Stage...
                    </option>
                    {PROGRESSION_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_CONFIG[s].label}
                      </option>
                    ))}
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedForBulk([])}
                  className="h-7 text-xs text-zinc-400 hover:text-white"
                >
                  Deselect
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
