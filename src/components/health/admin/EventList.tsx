import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { HealthEvent, EventType } from '../../../types/health';
import type { ScoreBreakdownItem } from '../../../utils/healthScoring';
import { isInherentlyPositive } from '../../../utils/healthScoring';
import { EVENT_META } from '../eventMeta';

interface EventListProps {
  events:          HealthEvent[];
  breakdown?:      ScoreBreakdownItem[];
  onUpdateStatus?: (eventId: string, status: 'in_progress' | 'resolved', note: string) => void;
  onDelete?:       (eventId: string) => void;
}

const ROLE_LABEL: Record<string, string> = {
  supervisor:  'Supervisor',
  cs:          'CS',
  operations:  'Operations',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ─── Status helpers ────────────────────────────────────────────────────────────

function isDisplayResolved(event: HealthEvent): boolean {
  return !!event.resolvedAt || event.resolutionStatus === 'resolved' || isInherentlyPositive(event);
}

// ─── Section divider ──────────────────────────────────────────────────────────

function SectionHeader({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 mt-2 mb-1.5">
      <div className="h-px flex-1" style={{ background: color + '30' }} />
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
        {label} ({count})
      </span>
      <div className="h-px flex-1" style={{ background: color + '30' }} />
    </div>
  );
}

// ─── Inline note form ─────────────────────────────────────────────────────────

interface NoteFormProps {
  mode:     'in_progress' | 'resolved';
  onSave:   (note: string) => void;
  onCancel: () => void;
}

function NoteForm({ mode, onSave, onCancel }: NoteFormProps) {
  const [note, setNote] = useState('');
  return (
    <div className="mt-2 flex flex-col gap-2">
      <textarea
        className="w-full text-[12px] text-text-primary border border-border-card rounded-[6px] px-2.5 py-2 resize-none bg-white focus:outline-none focus:ring-1 focus:ring-[#00A2B2]/40"
        rows={2}
        placeholder="Resolution note (optional)…"
        value={note}
        onChange={e => setNote(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="text-[11px] font-semibold text-text-subtle hover:text-text-primary px-3 py-1 rounded border border-border-card hover:border-border-card/80 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(note)}
          className="text-[11px] font-semibold text-white px-3 py-1 rounded transition-all"
          style={{ background: mode === 'resolved' ? '#16A34A' : '#D97706' }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Single event card ────────────────────────────────────────────────────────

interface EventCardProps {
  event:           HealthEvent;
  impact:          number;
  isExpanded:      boolean;
  isUnread:        boolean;
  onToggle:        () => void;
  onUpdateStatus?: (eventId: string, status: 'in_progress' | 'resolved', note: string) => void;
  onDelete?:       (eventId: string) => void;
}

function EventCard({ event, impact, isExpanded, isUnread, onToggle, onUpdateStatus, onDelete }: EventCardProps) {
  const [noteMode, setNoteMode] = useState<'in_progress' | 'resolved' | null>(null);

  const meta       = EVENT_META[event.type];
  const Icon       = meta.Icon;
  const resolved   = isDisplayResolved(event);
  const inProgress = !resolved && event.resolutionStatus === 'in_progress';
  const autoResolved = isInherentlyPositive(event);

  function handleSave(note: string) {
    if (!noteMode) return;
    onUpdateStatus?.(event.id, noteMode, note);
    setNoteMode(null);
  }

  return (
    <div className={`rounded-[8px] border overflow-hidden transition-opacity ${
      resolved ? 'border-border-card bg-white opacity-55' : 'border-border-card bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
    }`}>
      {/* Summary row */}
      <div
        className="flex items-start gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-surface-header transition-colors"
        onClick={onToggle}
      >
        {/* Left column */}
        <div className="flex-1 min-w-0">
          {/* Row 1: unread dot, icon, type label, date */}
          <div className="flex items-center gap-2">
            {isUnread
              ? <span className="w-2 h-2 rounded-full bg-[#DC2626] flex-shrink-0" />
              : <span className="w-2 h-2 flex-shrink-0" />
            }
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: meta.color + '12', border: `1px solid ${meta.color}25` }}
            >
              <Icon size={11} color={meta.color} />
            </div>
            <span className={`text-[12px] font-semibold ${resolved ? 'text-text-subtle' : 'text-text-primary'}`}>
              {meta.label}
            </span>
            <span className="text-[11px] text-text-subtle flex-shrink-0">{formatDate(event.loggedAt)}</span>
          </div>
          {/* Row 2: description, indented under icon */}
          <p className="text-[11px] text-text-subtle leading-snug line-clamp-2 pl-[48px] mt-0.5">
            {event.description}
          </p>
        </div>

        {/* Right column */}
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0 pl-3">
          {impact !== 0 && (
            <span
              className="text-[20px] font-bold tabular-nums leading-none"
              style={{ color: impact > 0 ? '#16A34A' : '#DC2626' }}
            >
              {impact > 0 ? `+${impact}` : `${impact}`}
            </span>
          )}
          <span className="text-[10px] text-text-subtle">
            {(() => {
              const days = Math.floor((Date.now() - new Date(event.loggedAt).getTime()) / 86_400_000);
              return days === 0 ? 'today' : `${days}d ago`;
            })()}
          </span>
          {isExpanded ? <ChevronUp size={12} className="text-text-subtle" /> : <ChevronDown size={12} className="text-text-subtle" />}
        </div>
      </div>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-2.5 border-t border-border-card bg-[#FAFBFC]">
          <div className="flex flex-col gap-3">

            {/* Description */}
            <div>
              <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-1">Description</p>
              <p className="text-[12px] text-text-primary leading-relaxed">{event.description}</p>
            </div>

            {/* Metadata grid */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-0.5">Reported by</p>
                <p className="text-[12px] text-text-primary">
                  {event.loggedBy}
                  <span className="text-text-subtle"> · {ROLE_LABEL[event.loggedByRole] ?? event.loggedByRole}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-0.5">Logged</p>
                <p className="text-[12px] text-text-primary">
                  {formatDate(event.loggedAt)} at {formatTime(event.loggedAt)}
                </p>
              </div>
              {event.contactName && (
                <div>
                  <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-0.5">Contact</p>
                  <p className="text-[12px] text-text-primary">
                    {event.contactName}
                    {event.startDate && <span className="text-text-subtle"> · started {event.startDate}</span>}
                  </p>
                </div>
              )}
              {event.cleanerName && (
                <div>
                  <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-0.5">Cleaner</p>
                  <p className="text-[12px] text-text-primary">
                    {event.cleanerName}
                    {event.startDate && <span className="text-text-subtle"> · started {event.startDate}</span>}
                  </p>
                </div>
              )}
              {event.visitedBy && (
                <div>
                  <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-0.5">Visited by</p>
                  <p className="text-[12px] text-text-primary">{event.visitedBy}</p>
                </div>
              )}
              {inProgress && event.inProgressAt && (
                <div>
                  <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-0.5">In Progress since</p>
                  <p className="text-[12px] text-[#D97706]">
                    {formatDate(event.inProgressAt)}
                    {event.inProgressBy && <span className="text-text-subtle"> by {event.inProgressBy}</span>}
                  </p>
                </div>
              )}
              {resolved && event.resolvedAt && (
                <div>
                  <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-0.5">Resolved</p>
                  <p className="text-[12px] text-[#16A34A]">
                    {formatDate(event.resolvedAt)}
                    {event.resolvedBy && <span className="text-text-subtle"> by {event.resolvedBy}</span>}
                  </p>
                </div>
              )}
            </div>

            {/* Resolution note */}
            {event.resolutionNote && (
              <div>
                <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-1">Resolution Note</p>
                <p className="text-[12px] text-text-primary leading-relaxed italic">"{event.resolutionNote}"</p>
              </div>
            )}

            {/* Action buttons (open / in-progress only; not for inherently positive events) */}
            {!resolved && !autoResolved && onUpdateStatus && (
              <div>
                {noteMode ? (
                  <NoteForm mode={noteMode} onSave={handleSave} onCancel={() => setNoteMode(null)} />
                ) : (
                  <div className="flex gap-2 pt-1">
                    {!inProgress && (
                      <button
                        onClick={() => setNoteMode('in_progress')}
                        className="text-[11px] font-semibold text-[#D97706] hover:text-white hover:bg-[#D97706] px-2.5 py-1 rounded border border-[#D97706]/40 hover:border-[#D97706] transition-all whitespace-nowrap"
                      >
                        Mark In Progress
                      </button>
                    )}
                    <button
                      onClick={() => setNoteMode('resolved')}
                      className="text-[11px] font-semibold text-[#16A34A] hover:text-white hover:bg-[#16A34A] px-2.5 py-1 rounded border border-[#16A34A]/40 hover:border-[#16A34A] transition-all whitespace-nowrap"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Photos */}
            <div>
              <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-1.5">Photos</p>
              {event.hasPhotos ? (
                <div className="flex gap-2">
                  {[1, 2, 3].map(n => (
                    <div
                      key={n}
                      className="w-14 h-14 rounded-[6px] bg-border-card/60 border border-border-card flex items-center justify-center"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-text-subtle/40" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-text-subtle/60 italic">No photos attached</p>
              )}
            </div>

            {/* Delete affordance */}
            {onDelete && (
              <div className="flex justify-end pt-1 border-t border-border-card mt-1">
                <button
                  onClick={() => onDelete(event.id)}
                  className="flex items-center gap-1 text-[11px] text-text-subtle hover:text-[#DC2626] transition-colors"
                >
                  <Trash2 size={11} />
                  Delete event
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EventList({ events, breakdown, onUpdateStatus, onDelete }: EventListProps) {
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [typeFilter,  setTypeFilter]  = useState<EventType | 'all'>('all');
  const [viewedIds,   setViewedIds]   = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('sm_viewed_events');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  function markViewed(id: string) {
    setViewedIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem('sm_viewed_events', JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-1.5">
        <p className="text-[12px] text-text-subtle text-center">No events logged yet.</p>
        <p className="text-[11px] text-text-subtle/60 text-center">Use "Log Event" to record the first activity on this deal.</p>
      </div>
    );
  }

  const getImpact = (eventId: string) => breakdown?.find(b => b.eventId === eventId)?.impact ?? 0;

  const byDate = (a: HealthEvent, b: HealthEvent) =>
    new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime();

  // Build type filter chips — only include types present in the data
  const presentTypes = Array.from(new Set(events.map(e => e.type))) as EventType[];

  const filtered = typeFilter === 'all' ? events : events.filter(e => e.type === typeFilter);

  const openEvents       = filtered.filter(e => !isDisplayResolved(e) && e.resolutionStatus == null).sort(byDate);
  const inProgressEvents = filtered.filter(e => !isDisplayResolved(e) && e.resolutionStatus === 'in_progress').sort(byDate);
  const resolvedEvents   = filtered.filter(e =>  isDisplayResolved(e)).sort(byDate);

  function renderSection(sectionEvents: HealthEvent[], label: string, color: string) {
    if (sectionEvents.length === 0) return null;
    return (
      <div>
        <SectionHeader label={label} count={sectionEvents.length} color={color} />
        <div className="flex flex-col gap-1.5">
          {sectionEvents.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              impact={getImpact(ev.id)}
              isExpanded={expandedId === ev.id}
              isUnread={!viewedIds.has(ev.id)}
              onToggle={() => {
                markViewed(ev.id);
                setExpandedId(expandedId === ev.id ? null : ev.id);
              }}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Event-type filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        {/* All chip */}
        <button
          onClick={() => setTypeFilter('all')}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap"
          style={{
            borderColor: typeFilter === 'all' ? '#00A2B2' : '#E0E0E0',
            background:  typeFilter === 'all' ? '#E0F7FA' : '#fff',
            color:       typeFilter === 'all' ? '#00A2B2' : '#6D6D6D',
          }}
        >
          All
          <span className="ml-1 text-[10px] font-bold opacity-70">{events.length}</span>
        </button>

        {presentTypes.map(type => {
          const meta    = EVENT_META[type];
          const count   = events.filter(e => e.type === type).length;
          const active  = typeFilter === type;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(active ? 'all' : type)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap"
              style={{
                borderColor: active ? '#00A2B2' : '#E0E0E0',
                background:  active ? '#E0F7FA' : '#fff',
                color:       active ? '#00A2B2' : '#6D6D6D',
              }}
            >
              {meta.label}
              <span className="ml-1 text-[10px] font-bold opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-1">
        {renderSection(openEvents,       'Open',        '#DC2626')}
        {renderSection(inProgressEvents, 'In Progress', '#D97706')}
        {renderSection(resolvedEvents,   'Resolved',    '#16A34A')}
        {filtered.length === 0 && (
          <p className="text-[12px] text-text-subtle text-center py-6">No events in this category.</p>
        )}
      </div>
    </div>
  );
}
