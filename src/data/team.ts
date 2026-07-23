export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  ring: 'outer' | 'inner';
  angle: number;
  initial: string;
  avatar: string;
  mandate: string;
  operates: string;
  builds: string;
  directs: string;
  bio: string[];
  email?: string;
  booking?: string;
};

const roleCopy: Record<string, Pick<TeamMember, 'mandate' | 'operates' | 'builds' | 'directs'>> = {
  'Team Lead': {
    mandate: 'Accountable, GSD.',
    operates: 'Ecosystems.',
    builds: 'Context and actionable outcomes.',
    directs: 'Soter’s scope, standards & strategy.',
  },
  'Technical PM': {
    mandate: 'Turns mandates into plans — scope, timelines, and delivery across engagements.',
    operates: 'Delivery across engagements: scope, timelines, and dependencies.',
    builds: 'Project structure — trackers, registries, and status routines.',
    directs: 'Prioritization calls and the definition of done.',
  },
  'Sky SME': {
    mandate: 'Subject-matter expert on the Sky Ecosystem — governance mechanics, Atlas, and protocol context.',
    operates: 'Governance context for live cycles: Atlas, spells, and protocol mechanics.',
    builds: 'Reference material and self-service knowledge for the team and clients.',
    directs: 'Technical positions on Sky Ecosystem questions.',
  },
  'OEA Dev': {
    mandate: 'Builds and reviews the onchain side — spells, deployments, and tooling for executor agents.',
    operates: 'Spell development, review, and deployment coordination for executor agents.',
    builds: 'Onchain tooling, checks, and automation around the deployment pipeline.',
    directs: 'Implementation approach for onchain changes.',
  },
  'Project Manager': {
    mandate: 'Keeps cycles on cadence — coordination, status, and expectations across every workstream.',
    operates: 'Cycle coordination: schedules, status, and follow-through across workstreams.',
    builds: 'The routines and templates that keep coordination cheap.',
    directs: 'Cadence and expectations across projects.',
  },
  'Exec Ops': {
    mandate: 'Executive operations — the connective tissue between clients, team, and commitments.',
    operates: 'Client relationships, commitments, and escalations.',
    builds: 'The bridges between clients, team, and partners.',
    directs: 'How engagements are structured and where attention goes.',
  },
  'Operations Specialist': {
    mandate: 'Runs day-to-day operations — monitoring, communications, and the routines that keep cycles moving.',
    operates: 'Day-to-day operations: monitoring, communications, and cycle routines.',
    builds: 'Process documentation and the checklists behind reliable delivery.',
    directs: 'Improvements to the routines they run.',
  },
  Contributor: {
    mandate: 'Contributes specialist capacity across Soter’s active work.',
    operates: 'Engagement support aligned to current project needs.',
    builds: 'Shared capacity across the team’s operational and technical work.',
    directs: 'Contributions within assigned workstreams.',
  },
};

const roster = [
  ['retro', 'Retro', 'Team Lead', 'outer', 270, 'hello@soterlabs.com', 'https://calendar.app.google/Q9Ac1p52M99UBFeX9'],
  ['louis', 'Louis', 'Technical PM', 'outer', 321.4],
  ['banxy', 'Banxy', 'Sky SME', 'outer', 12.9],
  ['jamilya', 'Jamilya', 'Project Manager', 'outer', 64.3],
  ['wolf', 'Wolf', 'Exec Ops', 'outer', 115.7],
  ['erwe', 'Erwe', 'Operations Specialist', 'outer', 167.1],
  ['ketcher', 'Ketcher', 'Sky SME', 'outer', 218.6],
  ['lakonema2000', 'lakonema2000', 'OEA Dev', 'inner', 330],
  ['filip', 'Filip', 'OEA Dev', 'inner', 30],
  ['adam', 'Adam', 'Contributor', 'inner', 90],
  ['lex', 'Lex', 'Contributor', 'inner', 150],
  ['kohla', 'Kohla', 'Contributor', 'inner', 210],
  ['nofreekoolaid', 'NoFreeKoolaid', 'Contributor', 'inner', 270],
] as const;

export const team: TeamMember[] = roster.map(([slug, name, role, ring, angle, email, booking]) => ({
  slug, name, role, ring, angle, email, booking, initial: name[0].toUpperCase(),
  avatar: `/assets/images/team/${slug}.png`, bio: [], ...roleCopy[role],
}));
