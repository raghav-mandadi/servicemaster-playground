import { useState } from 'react';
import type { AccountHealthScore, CriterionRating } from '../../types/health';
import { WelcomeScreen } from './mobile/WelcomeScreen';
import { CriteriaSelect } from './mobile/CriteriaSelect';
import { CriteriaConfirm } from './mobile/CriteriaConfirm';
import { PostJobIntro } from './mobile/PostJobIntro';
import { CriterionRate } from './mobile/CriterionRate';
import { GutCheck } from './mobile/GutCheck';
import { ThankYou } from './mobile/ThankYou';

export type PreviewMode = 'prejob' | 'postjob';

interface MobileAppProps {
  mode: PreviewMode;
  account: AccountHealthScore | null;
  onModeChange?: (mode: PreviewMode) => void;
}

type PreJobScreen = 'welcome' | 'select' | 'confirm';
type PostJobScreen = 'intro' | `rate-${number}` | 'gutcheck' | 'thankyou';

export function MobileApp({ mode, account, onModeChange }: MobileAppProps) {
  // Pre-job state
  const [preJobScreen, setPreJobScreen] = useState<PreJobScreen>('welcome');
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);

  // Post-job state
  const [postJobScreen, setPostJobScreen] = useState<PostJobScreen>('intro');
  const [ratingIndex, setRatingIndex] = useState(0);
  const [ratings, setRatings] = useState<{ criterion: string; rating: CriterionRating; note?: string }[]>([]);
  const [gutCheck, setGutCheck] = useState<'positive' | 'negative' | null>(null);

  // Use the most recent pre-job survey's criteria for post-job, or fallback
  const preJobCriteria: string[] =
    account?.preJobSurveys[0]?.selectedCriteria ??
    ['restrooms', 'floors', 'trash', 'surfaces', 'lobby'];

  const surveyAvg = account?.lastSurveyScore ?? null;

  function resetPreJob() {
    setPreJobScreen('welcome');
    setSelectedCriteria([]);
  }

  function resetPostJob() {
    setPostJobScreen('intro');
    setRatingIndex(0);
    setRatings([]);
    setGutCheck(null);
  }

  const accountName = account?.accountName ?? 'Sandra';
  const firstName = accountName.split(' ')[0];
  const scheduledDate = account?.preJobSurveys[0]?.scheduledDate ?? '2025-01-20';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Mode tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #E6E8ED',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        {(['prejob', 'postjob'] as PreviewMode[]).map(m => (
          <button
            key={m}
            onClick={() => {
              onModeChange?.(m);
              if (m === 'prejob') resetPreJob();
              else resetPostJob();
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: 13,
              fontWeight: mode === m ? 600 : 400,
              color: mode === m ? '#00A2B2' : '#6D6D6D',
              borderBottom: mode === m ? '2px solid #00A2B2' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'Helvetica Neue, sans-serif',
            }}
          >
            {m === 'prejob' ? 'Pre-Job' : 'Post-Job'}
          </button>
        ))}
      </div>

      {/* Screen content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {mode === 'prejob' && (
          <>
            {preJobScreen === 'welcome' && (
              <WelcomeScreen
                firstName={firstName}
                scheduledDate={scheduledDate}
                onNext={() => setPreJobScreen('select')}
              />
            )}
            {preJobScreen === 'select' && (
              <CriteriaSelect
                selected={selectedCriteria}
                onChange={setSelectedCriteria}
                onNext={() => setPreJobScreen('confirm')}
              />
            )}
            {preJobScreen === 'confirm' && (
              <CriteriaConfirm
                selected={selectedCriteria}
                onDone={resetPreJob}
              />
            )}
          </>
        )}

        {mode === 'postjob' && (
          <>
            {postJobScreen === 'intro' && (
              <PostJobIntro
                criteria={preJobCriteria}
                onStart={() => {
                  setRatingIndex(0);
                  setRatings([]);
                  setPostJobScreen(`rate-0`);
                }}
              />
            )}
            {postJobScreen.startsWith('rate-') && (
              <CriterionRate
                criterion={preJobCriteria[ratingIndex]}
                current={ratingIndex}
                total={preJobCriteria.length}
                onNext={(rating, note) => {
                  const updated = [...ratings, { criterion: preJobCriteria[ratingIndex], rating, note }];
                  setRatings(updated);
                  const next = ratingIndex + 1;
                  if (next >= preJobCriteria.length) {
                    setPostJobScreen('gutcheck');
                  } else {
                    setRatingIndex(next);
                    setPostJobScreen(`rate-${next}`);
                  }
                }}
                onBack={() => {
                  if (ratingIndex === 0) {
                    setPostJobScreen('intro');
                  } else {
                    const prev = ratingIndex - 1;
                    setRatingIndex(prev);
                    setRatings(r => r.slice(0, -1));
                    setPostJobScreen(`rate-${prev}`);
                  }
                }}
              />
            )}
            {postJobScreen === 'gutcheck' && (
              <GutCheck
                onSubmit={(sentiment) => {
                  setGutCheck(sentiment);
                  setPostJobScreen('thankyou');
                }}
              />
            )}
            {postJobScreen === 'thankyou' && (
              <ThankYou
                firstName={firstName}
                avgScore={surveyAvg ?? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length)}
                hasLowRating={ratings.some(r => r.rating <= 2)}
                sentiment={gutCheck ?? 'positive'}
                onReset={resetPostJob}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
