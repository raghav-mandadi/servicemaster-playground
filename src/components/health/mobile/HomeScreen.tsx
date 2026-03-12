import { RefreshCw, MessageSquare, AlertCircle, Phone, Lock } from 'lucide-react';

type SurveyKey = 'prejob' | 'recurring' | 'postjob';

interface Job {
  dealName:      string;
  scheduledDate: string; // ISO date string
}

interface HomeScreenProps {
  firstName:        string;
  accountName:      string;
  jobs:             Job[];
  completedSurveys: Set<SurveyKey>;
  onStartSurvey:    (survey: SurveyKey) => void;
  onFeedback:       () => void;
  onComplaint:      () => void;
  onContact:        () => void;
  onReset:          () => void;
}

const SURVEY_META: Record<SurveyKey, { label: string; sublabel: string }> = {
  prejob:    { label: 'Pre-Job Survey',             sublabel: 'Set your standards before service' },
  recurring: { label: 'Recurring Satisfaction',     sublabel: 'Quick check-in while team is on site' },
  postjob:   { label: 'Post-Job Survey',            sublabel: 'Rate your service after it\'s done' },
};

const SURVEY_ORDER: SurveyKey[] = ['prejob', 'recurring', 'postjob'];

function nextSurvey(completed: Set<SurveyKey>): SurveyKey | null {
  return SURVEY_ORDER.find(s => !completed.has(s)) ?? null;
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
    full:    d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    short:   d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

export function HomeScreen({
  firstName,
  accountName,
  jobs,
  completedSurveys,
  onStartSurvey,
  onFeedback,
  onComplaint,
  onContact,
  onReset,
}: HomeScreenProps) {
  const next = nextSurvey(completedSurveys);
  const allDone = next === null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Helvetica Neue, sans-serif', background: '#F4F7FA' }}>

      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 18px 14px', borderBottom: '1px solid #E6E8ED' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, background: '#00A2B2', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>S</span>
            </div>
            <span style={{ fontSize: 12, color: '#8E8E93', fontWeight: 500 }}>ServiceMaster Clean</span>
          </div>
          {/* Refresh */}
          <button
            onClick={onReset}
            title="Restart preview"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <RefreshCw size={15} color="#8E8E93" />
          </button>
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#1C1B1F', margin: '10px 0 1px', lineHeight: 1.2 }}>Hi, {firstName}</p>
        <p style={{ fontSize: 12, color: '#8E8E93', margin: 0 }}>{accountName}</p>
      </div>

      <div style={{ flex: 1, padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Upcoming services section */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 10px' }}>
            Upcoming Services
          </p>

          {jobs.map((job, idx) => {
            const date   = formatDate(job.scheduledDate);
            const isNext = idx === 0;
            return (
              <JobCard
                key={idx}
                job={job}
                date={date}
                isNext={isNext}
                completedSurveys={completedSurveys}
                nextSurvey={next}
                allDone={allDone}
                onStartSurvey={onStartSurvey}
              />
            );
          })}
        </div>

        {/* Quick actions */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 10px' }}>
            Quick Actions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ActionRow
              icon={<MessageSquare size={15} color="#6D6D6D" />}
              label="Share Feedback"
              sublabel="Tell us how we're doing"
              onClick={onFeedback}
            />
            <ActionRow
              icon={<AlertCircle size={15} color="#DC2626" />}
              label="Report an Issue"
              sublabel="We'll follow up promptly"
              onClick={onComplaint}
            />
            <ActionRow
              icon={<Phone size={15} color="#6D6D6D" />}
              label="Contact Us"
              sublabel="Phone, email, office hours"
              onClick={onContact}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Job Card ────────────────────────────────────────────────────────────────

function JobCard({
  job, date, isNext, completedSurveys, nextSurvey, allDone, onStartSurvey,
}: {
  job:              Job;
  date:             ReturnType<typeof formatDate>;
  isNext:           boolean;
  completedSurveys: Set<SurveyKey>;
  nextSurvey:       SurveyKey | null;
  allDone:          boolean;
  onStartSurvey:    (s: SurveyKey) => void;
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E6E8ED', borderRadius: 14, overflow: 'hidden', boxShadow: isNext ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', marginBottom: 10 }}>

      {/* Date banner */}
      <div style={{ background: isNext ? '#00A2B2' : '#F4F7FA', padding: '14px 16px' }}>
        {isNext && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 8px', marginBottom: 6 }}>
            <div style={{ width: 5, height: 5, background: '#fff', borderRadius: '50%' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' }}>Next service</span>
          </div>
        )}
        <p style={{ fontSize: isNext ? 20 : 16, fontWeight: 700, color: isNext ? '#fff' : '#1C1B1F', margin: 0, lineHeight: 1.2 }}>
          {date.weekday}
        </p>
        <p style={{ fontSize: isNext ? 13 : 12, color: isNext ? 'rgba(255,255,255,0.8)' : '#8E8E93', margin: '2px 0 0' }}>
          {date.full} &nbsp;·&nbsp; {job.dealName}
        </p>
      </div>

      {/* Survey steps */}
      <div style={{ padding: '4px 0' }}>
        {SURVEY_ORDER.map((key, i) => {
          const meta    = SURVEY_META[key];
          const done    = completedSurveys.has(key);
          const isActive = nextSurvey === key && !allDone;
          const locked  = !done && !isActive;

          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 16px',
                borderTop: i > 0 ? '1px solid #F2F2F7' : 'none',
                opacity: locked ? 0.45 : 1,
              }}
            >
              {/* Step circle */}
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: done ? '#00A2B2' : isActive ? '#E6F8FA' : '#F2F2F7',
                border: isActive ? '1.5px solid #00A2B2' : 'none',
              }}>
                {done ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : locked ? (
                  <Lock size={11} color="#C7C7CC" />
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#00A2B2' }}>{i + 1}</span>
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B1F', margin: 0, lineHeight: 1.3 }}>{meta.label}</p>
                <p style={{ fontSize: 11, color: '#8E8E93', margin: '1px 0 0' }}>{meta.sublabel}</p>
              </div>

              {/* Action */}
              {done ? (
                <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, flexShrink: 0 }}>Done</span>
              ) : isActive ? (
                <button
                  onClick={() => onStartSurvey(key)}
                  style={{
                    padding: '6px 12px',
                    background: '#00A2B2',
                    color: '#fff',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                    fontFamily: 'Helvetica Neue, sans-serif',
                  }}
                >
                  Start
                </button>
              ) : null}
            </div>
          );
        })}

        {/* All done state */}
        {allDone && (
          <div style={{ padding: '10px 16px 12px', borderTop: '1px solid #F2F2F7', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, background: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontSize: 12, color: '#15803D', fontWeight: 500, margin: 0 }}>All surveys complete — thank you!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Action Row ────────────────────────────────────────────────────────────────

function ActionRow({ icon, label, sublabel, onClick }: {
  icon:     React.ReactNode;
  label:    string;
  sublabel: string;
  onClick:  () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#fff',
        border: '1px solid #E6E8ED',
        borderRadius: 12,
        padding: '11px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div style={{ width: 30, height: 30, background: '#F4F7FA', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B1F', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 11, color: '#8E8E93', margin: '1px 0 0' }}>{sublabel}</p>
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M5 10l4-3-4-3" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
