import { useState } from 'react';
import type { AccountHealthScore, CriterionRating } from '../../types/health';
import { HomeScreen }       from './mobile/HomeScreen';
import { WelcomeScreen }    from './mobile/WelcomeScreen';
import { CriteriaSelect }   from './mobile/CriteriaSelect';
import { CriteriaConfirm }  from './mobile/CriteriaConfirm';
import { PostJobIntro }     from './mobile/PostJobIntro';
import { CriterionRate }    from './mobile/CriterionRate';
import { GutCheck }         from './mobile/GutCheck';
import { ThankYou }         from './mobile/ThankYou';
import { RecurringSurvey }  from './mobile/RecurringSurvey';
import { FeedbackForm }     from './mobile/FeedbackForm';
import { ComplaintForm }    from './mobile/ComplaintForm';
import { ContactScreen }    from './mobile/ContactScreen';

export type PreviewMode = 'prejob' | 'postjob';
type SurveyKey = 'prejob' | 'recurring' | 'postjob';
type Section   = 'home' | 'prejob' | 'recurring' | 'postjob' | 'feedback' | 'complaint' | 'contact';
type PreJobScreen  = 'welcome' | 'select' | 'confirm';
type PostJobScreen = 'intro' | `rate-${number}` | 'gutcheck' | 'thankyou';

interface MobileAppProps {
  mode?:         PreviewMode;
  account:       AccountHealthScore | null;
  onModeChange?: (mode: PreviewMode) => void;
}

export function MobileApp({ account }: MobileAppProps) {
  // Navigation
  const [section,  setSection]  = useState<Section>('home');

  // Survey completion
  const [completedSurveys, setCompletedSurveys] = useState<Set<SurveyKey>>(new Set());

  // Pre-job state
  const [preJobScreen,     setPreJobScreen]     = useState<PreJobScreen>('welcome');
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);

  // Post-job state
  const [postJobScreen, setPostJobScreen] = useState<PostJobScreen>('intro');
  const [ratingIndex,   setRatingIndex]   = useState(0);
  const [ratings,       setRatings]       = useState<{ criterion: string; rating: CriterionRating; note?: string }[]>([]);
  const [gutCheck,      setGutCheck]      = useState<'positive' | 'negative' | null>(null);

  const preJobCriteria: string[] =
    account?.preJobSurveys[0]?.selectedCriteria ??
    ['restrooms', 'floors', 'trash', 'surfaces', 'lobby'];

  const surveyAvg    = account?.lastSurveyScore ?? null;
  const accountName  = account?.accountName ?? 'Your Location';
  const firstName    = accountName.split(' ')[0];
  const scheduledDate = account?.preJobSurveys[0]?.scheduledDate ?? '2025-01-23';
  const dealName     = account?.dealName ?? 'Bi-Weekly Cleaning';

  const jobs = [{ dealName, scheduledDate }];

  function complete(survey: SurveyKey) {
    setCompletedSurveys(prev => new Set([...prev, survey]));
    setSection('home');
  }

  function resetAll() {
    setCompletedSurveys(new Set());
    setSection('home');
    setPreJobScreen('welcome');
    setSelectedCriteria([]);
    setPostJobScreen('intro');
    setRatingIndex(0);
    setRatings([]);
    setGutCheck(null);
  }

  function startSurvey(key: SurveyKey) {
    if (key === 'prejob') {
      setPreJobScreen('welcome');
      setSelectedCriteria([]);
      setSection('prejob');
    } else if (key === 'recurring') {
      setSection('recurring');
    } else {
      setPostJobScreen('intro');
      setRatingIndex(0);
      setRatings([]);
      setGutCheck(null);
      setSection('postjob');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

        {/* ── Home ── */}
        {section === 'home' && (
          <HomeScreen
            firstName={firstName}
            accountName={accountName}
            jobs={jobs}
            completedSurveys={completedSurveys}
            onStartSurvey={startSurvey}
            onFeedback={() => setSection('feedback')}
            onComplaint={() => setSection('complaint')}
            onContact={() => setSection('contact')}
            onReset={resetAll}
          />
        )}

        {/* ── Pre-job flow ── */}
        {section === 'prejob' && (
          <>
            {preJobScreen === 'welcome' && (
              <WelcomeScreen
                firstName={firstName}
                scheduledDate={scheduledDate}
                onNext={() => setPreJobScreen('select')}
                onSkip={() => complete('prejob')}
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
                onDone={() => complete('prejob')}
              />
            )}
          </>
        )}

        {/* ── Recurring satisfaction ── */}
        {section === 'recurring' && (
          <RecurringSurvey
            onBack={() => setSection('home')}
            onComplete={() => complete('recurring')}
          />
        )}

        {/* ── Post-job flow ── */}
        {section === 'postjob' && (
          <>
            {postJobScreen === 'intro' && (
              <PostJobIntro
                criteria={preJobCriteria}
                onStart={() => {
                  setRatingIndex(0);
                  setRatings([]);
                  setPostJobScreen('rate-0');
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
                onReset={() => complete('postjob')}
              />
            )}
          </>
        )}

        {/* ── Feedback ── */}
        {section === 'feedback'  && <FeedbackForm  onBack={() => setSection('home')} />}

        {/* ── Complaint ── */}
        {section === 'complaint' && <ComplaintForm onBack={() => setSection('home')} />}

        {/* ── Contact ── */}
        {section === 'contact'   && <ContactScreen onBack={() => setSection('home')} />}

      </div>
    </div>
  );
}
