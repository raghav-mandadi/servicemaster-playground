import { CRITERIA_META, getCriterionMeta } from '../../../types/health';
import type { PostJobSurveyResponse } from '../../../types/health';

interface SurveyHistoryProps {
  surveys: PostJobSurveyResponse[];
}

function RatingBar({ rating }: { rating: number }) {
  const color = rating >= 4 ? '#16A34A' : rating >= 3 ? '#D97706' : '#DC2626';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-border-card rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${(rating / 5) * 100}%`, background: color }}
        />
      </div>
      <span className="text-[11px] text-text-subtle w-6">{rating}/5</span>
    </div>
  );
}

export function SurveyHistory({ surveys }: SurveyHistoryProps) {
  if (surveys.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider">
        Survey History
      </p>

      {surveys.map(survey => {
        const scoreColor = survey.averageScore >= 4 ? '#16A34A' : survey.averageScore >= 3 ? '#D97706' : '#DC2626';
        return (
          <div key={survey.id} className="bg-surface-header rounded-[6px] border border-border-card px-4 py-3">
            {/* Header */}
            <div className="flex items-baseline justify-between mb-2.5">
              <span className="text-[12px] font-medium text-text-primary">{survey.serviceDate}</span>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[14px] font-semibold"
                  style={{ color: scoreColor }}
                >
                  {survey.averageScore.toFixed(1)}<span className="text-[11px] text-text-subtle font-normal">/5</span>
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: survey.overallSentiment === 'positive' ? '#16A34A' : '#DC2626' }}
                >
                  {survey.overallSentiment === 'positive' ? 'Satisfied' : 'Not satisfied'}
                </span>
              </div>
            </div>

            {/* Per-criterion ratings */}
            <div className="flex flex-col gap-2">
              {survey.criterionRatings.map(cr => {
                const meta = CRITERIA_META.find(m => m.key === cr.criterion) ?? getCriterionMeta(cr.criterion);
                return (
                  <div key={cr.criterion} className="flex items-center gap-2">
                    <span className="text-[12px] text-text-subtle w-32 truncate flex-shrink-0">{meta.label}</span>
                    <RatingBar rating={cr.rating} />
                    {cr.note && (
                      <span className="text-[11px] text-text-subtle truncate max-w-[140px]">&ldquo;{cr.note}&rdquo;</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Follow-up note */}
            {survey.followUpNote && (
              <p className="text-[12px] text-[#B91C1C] mt-2.5 leading-relaxed border-t border-border-card pt-2">
                &ldquo;{survey.followUpNote}&rdquo;
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
