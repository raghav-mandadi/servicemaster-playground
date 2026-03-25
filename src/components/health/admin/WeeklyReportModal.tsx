import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Printer, CheckCircle2, Clock, Calendar } from 'lucide-react';
import type { HealthEvent } from '../../../types/health';
import type { ScoreBreakdownItem } from '../../../utils/healthScoring';
import { EVENT_META } from '../eventMeta';

interface WeeklyReportModalProps {
  events:     HealthEvent[];
  breakdown?: ScoreBreakdownItem[];
  dealName:   string;
  onClose:    () => void;
}

// ─── Week helpers ─────────────────────────────────────────────────────────────

function getISOWeekStart(date: Date): Date {
  const d   = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  return `${weekStart.toLocaleDateString('en-US', opts)} – ${weekEnd.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface WeekData {
  weekStart:  Date;
  logged:     HealthEvent[];
  resolved:   HealthEvent[];
  inProgress: HealthEvent[];
}

function buildWeeks(events: HealthEvent[]): WeekData[] {
  const now           = new Date();
  const thisWeekStart = getISOWeekStart(now);
  return Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date(thisWeekStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
    const inRange = (iso: string | undefined) => {
      if (!iso) return false;
      const t = new Date(iso);
      return t >= weekStart && t < weekEnd;
    };
    return {
      weekStart,
      logged:     events.filter(e => inRange(e.loggedAt)),
      resolved:   events.filter(e => inRange(e.resolvedAt)),
      inProgress: events.filter(e => inRange(e.inProgressAt)),
    };
  });
}

// ─── Single event row ─────────────────────────────────────────────────────────

function EventRow({ event, impact, accent }: {
  event:  HealthEvent;
  impact: number;
  accent: 'resolved' | 'in_progress' | 'logged';
}) {
  const meta = EVENT_META[event.type];
  const Icon = meta.Icon;
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: meta.color + '15', border: `1px solid ${meta.color}30` }}
      >
        <Icon size={10} color={meta.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-medium text-text-primary">{meta.label}</span>
          {impact !== 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-px rounded tabular-nums"
              style={{
                background: (impact > 0 ? '#16A34A' : '#DC2626') + '15',
                color:       impact > 0 ? '#16A34A' : '#DC2626',
              }}
            >
              {impact > 0 ? '+' : ''}{impact}
            </span>
          )}
        </div>
        {event.resolutionNote && (
          <p className="text-[11px] text-text-subtle mt-0.5 italic">"{event.resolutionNote}"</p>
        )}
        <p className="text-[10px] text-text-subtle/60 mt-0.5">
          {formatDate(event.loggedAt)}
          {accent === 'resolved'    && event.resolvedBy   && ` · resolved by ${event.resolvedBy}`}
          {accent === 'in_progress' && event.inProgressBy && ` · by ${event.inProgressBy}`}
        </p>
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function WeeklyReportModal({ events, breakdown, dealName, onClose }: WeeklyReportModalProps) {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 3 = 3 weeks ago
  const weeks   = buildWeeks(events);
  const week    = weeks[weekOffset];
  const getImpact = (id: string) => breakdown?.find(b => b.eventId === id)?.impact ?? 0;

  const isEmpty = week.logged.length === 0 && week.resolved.length === 0 && week.inProgress.length === 0;

  function handlePrint() {
    window.print();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[12px] w-[560px] max-h-[85vh] flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-card flex-shrink-0">
          <div>
            <p className="text-[14px] font-semibold text-text-primary">Weekly Report</p>
            <p className="text-[11px] text-text-subtle mt-0.5">{dealName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-surface-header hover:bg-border-card transition-colors"
          >
            <X size={14} className="text-text-subtle" />
          </button>
        </div>

        {/* Week navigation bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-card bg-surface-header flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWeekOffset(o => o + 1)}
              disabled={weekOffset >= 3}
              className="w-6 h-6 rounded flex items-center justify-center border border-border-card hover:border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={13} className="text-text-subtle" />
            </button>
            <div className="flex items-center gap-1.5">
              <Calendar size={11} className="text-text-subtle" />
              <span className="text-[12px] font-medium text-text-primary">{formatWeekRange(week.weekStart)}</span>
              {weekOffset === 0 && (
                <span className="text-[10px] font-medium text-[#00A2B2] bg-[#E0F7FA] px-1.5 py-px rounded">This week</span>
              )}
            </div>
            <button
              onClick={() => setWeekOffset(o => o - 1)}
              disabled={weekOffset <= 0}
              className="w-6 h-6 rounded flex items-center justify-center border border-border-card hover:border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={13} className="text-text-subtle" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-subtle">
              Week {weekOffset + 1} of 4
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#00A2B2] hover:bg-[#008A99] px-2.5 py-1.5 rounded-[6px] transition-colors"
            >
              <Printer size={11} />
              Save as PDF
            </button>
          </div>
        </div>

        {/* Week content */}
        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Calendar size={24} className="text-text-subtle/30" />
              <p className="text-[12px] text-text-subtle">No activity this week.</p>
            </div>
          ) : (
            <>
              {/* Summary chips */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-text-subtle bg-surface-header border border-border-card px-2.5 py-1 rounded-full">
                  {week.logged.length} logged
                </span>
                {week.resolved.length > 0 && (
                  <span className="text-[11px] font-semibold text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/20 px-2.5 py-1 rounded-full">
                    {week.resolved.length} resolved
                  </span>
                )}
                {week.inProgress.length > 0 && (
                  <span className="text-[11px] font-semibold text-[#D97706] bg-[#FFFBEB] border border-[#D97706]/20 px-2.5 py-1 rounded-full">
                    {week.inProgress.length} in progress
                  </span>
                )}
              </div>

              {/* Resolved */}
              {week.resolved.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={12} color="#16A34A" />
                    <span className="text-[10px] font-semibold text-[#16A34A] uppercase tracking-wider">
                      Resolved ({week.resolved.length})
                    </span>
                  </div>
                  <div className="divide-y divide-border-card/50 bg-white border border-border-card rounded-[8px] px-3">
                    {week.resolved.map(ev => (
                      <EventRow key={ev.id} event={ev} impact={getImpact(ev.id)} accent="resolved" />
                    ))}
                  </div>
                </div>
              )}

              {/* In Progress */}
              {week.inProgress.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock size={12} color="#D97706" />
                    <span className="text-[10px] font-semibold text-[#D97706] uppercase tracking-wider">
                      Marked In Progress ({week.inProgress.length})
                    </span>
                  </div>
                  <div className="divide-y divide-border-card/50 bg-white border border-border-card rounded-[8px] px-3">
                    {week.inProgress.map(ev => (
                      <EventRow key={ev.id} event={ev} impact={getImpact(ev.id)} accent="in_progress" />
                    ))}
                  </div>
                </div>
              )}

              {/* Logged */}
              {week.logged.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#6D6D6D]" />
                    <span className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider">
                      Logged This Week ({week.logged.length})
                    </span>
                  </div>
                  <div className="divide-y divide-border-card/50 bg-white border border-border-card rounded-[8px] px-3">
                    {week.logged.map(ev => (
                      <EventRow key={ev.id} event={ev} impact={getImpact(ev.id)} accent="logged" />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
