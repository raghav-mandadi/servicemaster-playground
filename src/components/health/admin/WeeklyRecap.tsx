import type { HealthEvent } from '../../../types/health';
import type { ScoreBreakdownItem } from '../../../utils/healthScoring';
import { EVENT_META } from '../eventMeta';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';

interface WeeklyRecapProps {
  events:    HealthEvent[];
  breakdown?: ScoreBreakdownItem[];
}

function getISOWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(weekStart: Date): string {
  return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface WeekGroup {
  weekStart:  Date;
  label:      string;
  logged:     HealthEvent[];
  resolved:   HealthEvent[];
  inProgress: HealthEvent[];
}

function buildWeekGroups(events: HealthEvent[]): WeekGroup[] {
  // Build last 4 weeks from today (current week + 3 prior)
  const now = new Date();
  const thisWeekStart = getISOWeekStart(now);
  const weeks: WeekGroup[] = [];

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(thisWeekStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

    const logged     = events.filter(e => {
      const t = new Date(e.loggedAt);
      return t >= weekStart && t < weekEnd;
    });
    const resolved   = events.filter(e => {
      const t = e.resolvedAt ? new Date(e.resolvedAt) : null;
      return t && t >= weekStart && t < weekEnd;
    });
    const inProgress = events.filter(e => {
      const t = e.inProgressAt ? new Date(e.inProgressAt) : null;
      return t && t >= weekStart && t < weekEnd;
    });

    weeks.push({ weekStart, label: formatWeekLabel(weekStart), logged, resolved, inProgress });
  }

  return weeks;
}

function EventRow({ event, impact, accent }: { event: HealthEvent; impact: number; accent: string }) {
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
          {accent === 'resolved' && event.resolvedBy && ` · resolved by ${event.resolvedBy}`}
          {accent === 'in_progress' && event.inProgressBy && ` · by ${event.inProgressBy}`}
        </p>
      </div>
    </div>
  );
}

export function WeeklyRecap({ events, breakdown }: WeeklyRecapProps) {
  const weeks = buildWeekGroups(events);
  const getImpact = (id: string) => breakdown?.find(b => b.eventId === id)?.impact ?? 0;

  const hasAnyActivity = weeks.some(w => w.logged.length > 0 || w.resolved.length > 0 || w.inProgress.length > 0);

  if (!hasAnyActivity) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Calendar size={24} className="text-text-subtle/40" />
        <p className="text-[12px] text-text-subtle">No activity in the last 4 weeks.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {weeks.map((week, i) => {
        const isEmpty = week.logged.length === 0 && week.resolved.length === 0 && week.inProgress.length === 0;
        return (
          <div key={week.label} className="bg-white border border-border-card rounded-[8px] overflow-hidden">
            {/* Week header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-card bg-surface-header">
              <div className="flex items-center gap-2">
                <Calendar size={11} className="text-text-subtle" />
                <span className="text-[11px] font-semibold text-text-primary">
                  Week of {week.label}
                  {i === 0 && <span className="ml-1.5 text-[10px] text-[#00A2B2] font-medium">This week</span>}
                </span>
              </div>
              <span className="text-[11px] text-text-subtle">
                {week.logged.length} logged · {week.resolved.length} resolved
              </span>
            </div>

            {isEmpty ? (
              <p className="text-[12px] text-text-subtle/60 px-4 py-4 italic">No activity this week.</p>
            ) : (
              <div className="px-4 py-3 flex flex-col gap-3">

                {/* Resolved */}
                {week.resolved.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 size={11} color="#16A34A" />
                      <span className="text-[10px] font-semibold text-[#16A34A] uppercase tracking-wider">
                        Resolved ({week.resolved.length})
                      </span>
                    </div>
                    <div className="divide-y divide-border-card/50">
                      {week.resolved.map(ev => (
                        <EventRow key={ev.id} event={ev} impact={getImpact(ev.id)} accent="resolved" />
                      ))}
                    </div>
                  </div>
                )}

                {/* In Progress */}
                {week.inProgress.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Clock size={11} color="#D97706" />
                      <span className="text-[10px] font-semibold text-[#D97706] uppercase tracking-wider">
                        Marked In Progress ({week.inProgress.length})
                      </span>
                    </div>
                    <div className="divide-y divide-border-card/50">
                      {week.inProgress.map(ev => (
                        <EventRow key={ev.id} event={ev} impact={getImpact(ev.id)} accent="in_progress" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Newly logged */}
                {week.logged.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                      <span className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider">
                        Logged ({week.logged.length})
                      </span>
                    </div>
                    <div className="divide-y divide-border-card/50">
                      {week.logged.map(ev => (
                        <EventRow key={ev.id} event={ev} impact={getImpact(ev.id)} accent="logged" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
