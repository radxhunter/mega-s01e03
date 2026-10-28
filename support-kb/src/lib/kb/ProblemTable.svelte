<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { splitTicket, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // issues: problem → the ticket filed for it; outcome: problem → what engineering decided; repo: where the tickets live.
  // oneDayIssue: the ticket the one-day reads were filed in before they were counted under their cause.
  let {
    ticket,
    issues = {},
    outcome = {},
    repo = '',
    oneDayIssue,
  }: {
    ticket: number;
    issues?: Partial<Record<Problem, number>>;
    outcome?: Partial<Record<Problem, string>>;
    repo?: string;
    oneDayIssue?: number;
  } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const link = (n: number) => `https://github.com/${repo}/issues/${n}`;
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports merged into #{ticket} ·
  <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>intake tagged otherwise</th><th>ticket</th><th>outcome</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.reports.length}</strong></td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{g.mistagged}</td>
        <td>{#if issues[g.problem]}<a href={link(issues[g.problem]!)}>{repo}#{issues[g.problem]}</a>{:else}—{/if}</td>
        <td>{outcome[g.problem] ?? '—'}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each split.groups.filter((g) => g.oneDay) as g (g.problem)}
  <p class="note">
    {g.oneDay} reports read as a one-day move; counted under <code>{g.problem}</code> by tenant{#if oneDayIssue}
      (<a href={link(oneDayIssue)}>{repo}#{oneDayIssue}</a>, closed as a duplicate){/if}.
  </p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
