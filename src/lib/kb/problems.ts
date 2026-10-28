// Splits what was merged into one ticket into the problems it really holds. Pages explain it; this file is what runs.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

// causes.ts knows two causes, both a day/month flip. A report the desk read as a one-day move
// (desk-notes.json) is read differently, but the desk counts a report where it is filed (by tenant,
// causes.ts). So a problem is the filed cause; one-day reads are counted under it and footnoted.
export type Problem = 'parser' | 'hint' | 'unplaced';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'unplaced'];

export function problemOf(r: Report, t: Tenant | undefined): Problem {
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // Reports in this group that intake tagged as something else.
  mistagged: number;
  // Reports in this group the desk read as a one-day move.
  oneDay: number;
};

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r));
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
        mistagged: rs.filter((r) => r.meta.intakeTag !== problem).length,
        oneDay: rs.filter((r) => oneDayMove.includes(r.id)).length,
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { merged, groups };
}
