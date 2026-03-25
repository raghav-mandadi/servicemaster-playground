// ─── Mock Data Loader ─────────────────────────────────────────────────────────
// Assembles AccountHealthScore[] and Account[] from the JSON data layer.
// JSON files are the source of truth for accounts, sites, events, users, and
// scoring templates. This loader joins them and computes live scores via
// computeLiveScore so every site reflects its current event log.
//
// To swap for a real API: replace the JSON imports with fetch calls and keep
// the same assembly logic in buildHealthScores() and buildAccounts().

import accountsJson  from './accounts.json';
import sitesJson     from './sites.json';
import eventsJson    from './events.json';

import type { AccountHealthScore, HealthEvent, HealthTier, HealthSignal, RiskProfile, SiteContact } from '../types/health';
import type { Account, AccountStatus, BuildingDetail } from '../types/index';
import { DEFAULT_SCORING_CONFIG }  from './scoringConfig';
import type { ScoringConfig }      from './scoringConfig';
import { computeLiveScore }        from '../utils/healthScoring';

// ── Types inferred from JSON (raw shapes before assembly) ────────────────────

interface RawSite {
  dealId:               string;
  accountId:            string;
  dealName:             string;
  address:              string;
  city:                 string;
  state:                string;
  serviceFrequency:     string;
  assignedSupervisorId: string;
  accountTier:          number;
  monthlyRevenue:       number;
  liveScoring:          boolean;
  lastSurveyDate:       string | null;
  lastSurveyScore:      number | null;
  signals:              HealthSignal[];
  actionItems:          string[];
  contractStartDate?:   string;
  contractEndDate?:     string;
  primaryContact?:      SiteContact;
  serviceNotes?:        string;
}

interface RawAccount {
  accountId:      string;
  accountName:    string;
  status:         string;
  industry:       string;
  primaryContact: {
    name:  string;
    title: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city:   string;
    state:  string;
    zip:    string;
  };
  memberSince: string;
  buildings:   BuildingDetail[];
}

// ── Health scores assembly ────────────────────────────────────────────────────

export function buildHealthScores(config: ScoringConfig = DEFAULT_SCORING_CONFIG): AccountHealthScore[] {
  return (sitesJson as RawSite[]).map(site => {
    const account = (accountsJson as unknown as RawAccount[]).find(a => a.accountId === site.accountId);
    const accountName = account?.accountName ?? site.accountId;

    const events = (eventsJson as HealthEvent[]).filter(e => e.dealId === site.dealId);
    const { score, tier, incidentOverride } = computeLiveScore(events, config);

    // Compute riskProfile from event history
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    const twelveMonthsAgoIso = twelveMonthsAgo.toISOString();

    const events12m = events.filter(e => e.loggedAt >= twelveMonthsAgoIso);
    const incidentCount12m = events12m.filter(
      e => e.type === 'complaint' || e.type === 'sensitive_event'
    ).length;
    const lastEventAt = events.reduce<string>((latest, ev) => {
      return ev.loggedAt > latest ? ev.loggedAt : latest;
    }, '');
    const watchlist = incidentCount12m >= 2;

    const computedRiskProfile: RiskProfile = {
      eventCount12m:    events12m.length,
      incidentCount12m,
      lastEventAt:      lastEventAt || new Date().toISOString(),
      watchlist,
      watchlistReason:  watchlist
        ? `${incidentCount12m} incident${incidentCount12m !== 1 ? 's' : ''} in 12 months`
        : undefined,
    };

    return {
      accountId:       site.accountId,
      accountName,
      dealId:          site.dealId,
      dealName:        site.dealName,
      score,
      tier:            tier as HealthTier,
      incidentOverride,
      trend:           0,
      accountTier:     site.accountTier as 1 | 2 | 3 | 4 | 5,
      monthlyRevenue:  site.monthlyRevenue,
      liveScoring:     site.liveScoring,
      riskProfile:     computedRiskProfile,
      lastComputedAt:  new Date().toISOString(),
      signals:         site.signals,
      lastSurveyDate:  site.lastSurveyDate,
      lastSurveyScore: site.lastSurveyScore,
      events,
      actionItems:       site.actionItems,
      address:           site.address,
      city:              site.city,
      state:             site.state,
      serviceFrequency:  site.serviceFrequency,
      contractStartDate: site.contractStartDate,
      contractEndDate:   site.contractEndDate,
      primaryContact:    site.primaryContact,
      serviceNotes:      site.serviceNotes,
    };
  });
}

// ── Accounts assembly ─────────────────────────────────────────────────────────

export function buildAccounts(): Account[] {
  const sites = sitesJson as RawSite[];
  const events = eventsJson as HealthEvent[];

  return (accountsJson as unknown as RawAccount[]).map(a => {
    const accountSites = sites.filter(s => s.accountId === a.accountId);
    const siteCount = accountSites.length;

    // Derive lastActivity from most recent event across all sites for this account
    const siteIds = new Set(accountSites.map(s => s.dealId));
    const accountEvents = events.filter(e => siteIds.has(e.dealId));
    const lastEventDate = accountEvents.reduce<string>((latest, ev) => {
      return ev.loggedAt > latest ? ev.loggedAt : latest;
    }, '');
    const lastActivity = lastEventDate
      ? new Date(lastEventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : a.memberSince;

    return {
      id:             a.accountId,
      name:           a.accountName,
      status:         a.status as AccountStatus,
      industry:       a.industry,
      primaryContact: a.primaryContact,
      address:        a.address,
      memberSince:    a.memberSince,
      buildings:      a.buildings,
      siteCount,
      lastActivity,
    };
  });
}

// Pre-built exports — used as static imports throughout the app.
export const accountHealthScores = buildHealthScores();
export const accounts = buildAccounts();
