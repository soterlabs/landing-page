export const navItems = [
  { href: '/about', label: 'About', key: 'about' },
  { href: '/services', label: 'Services', key: 'services' },
  { href: '/clients', label: 'Work', key: 'clients' },
  { href: '/values', label: 'Values', key: 'values' },
  { href: '/contact', label: 'Contact', key: 'contact' },
] as const;

export const operatingAxes = [
  { name: 'Strategy', description: 'Translate intent into a clear operating direction.' },
  { name: 'Consensus', description: 'Align decisions, responsibilities, and expectations.' },
  { name: 'Incentives', description: 'Connect responsibilities to durable participation and outcomes.' },
  { name: 'Coordination', description: 'Keep people, systems, and recurring work moving together.' },
] as const;

export const operatingPrinciples = [
  { name: 'Detail', description: 'Understand the work closely enough to see its dependencies, constraints, and intended outcomes.' },
  { name: 'Ownership', description: 'Make responsibilities explicit so every part of the work has a visible owner.' },
  { name: 'Evidence', description: 'Build validation, records, and reporting into the operation from the start.' },
  { name: 'Communication', description: 'Translate operational detail into useful context, decisions, and next actions.' },
] as const;

export const services = [
  {
    id: 'operations', angle: 0, tag: 'Recurring work', name: 'Managed Operations',
    short: 'Recurring operations with clear ownership and consistent follow-through.',
    lede: 'Important operating cycles carried with visible ownership, active monitoring, and consistent follow-through.',
    items: ['Governance and protocol operations', 'Recurring operating cycles', 'Calendars, responsibilities, and dependencies', 'Monitoring, exception handling, and follow-through'],
  },
  {
    id: 'process', angle: 72, tag: 'Repeatable systems', name: 'Process Design',
    short: 'Methods and controls that make complex work repeatable.',
    lede: 'Expectations and requirements translated into practical frameworks designed around the actual work.',
    items: ['Operational frameworks and methodologies', 'SOPs, runbooks, and workflow design', 'Approval paths and control design', 'Handoffs, escalation routes, and evidence requirements'],
  },
  {
    id: 'infrastructure', angle: 144, tag: 'Execution layer', name: 'On/Offchain Infra',
    short: 'The infrastructure and execution layer behind live operations.',
    lede: 'Technical systems supporting calculations, transactions, deployments, monitoring, and recurring delivery.',
    items: ['Settlement and calculation infrastructure', 'Onchain transaction coordination', 'Spell and contract deployment support', 'Automation, monitoring, and integration support'],
  },
  {
    id: 'reporting', angle: 216, tag: 'Visible outcomes', name: 'Reporting & Transparency',
    short: 'Operational detail translated into information people can use.',
    lede: 'Validated operational detail made actionable to the people who depend on it.',
    items: ['Operational and cycle reporting', 'Data validation and provenance', 'Executive summaries, exceptions, and next actions', 'Public or stakeholder-facing reporting layers'],
  },
  {
    id: 'delivery', angle: 288, tag: 'Cross-functional delivery', name: 'Program Incubation',
    short: 'Delivery for initiatives that do not fit neatly inside one team.',
    lede: 'Complex programs, launches, and emerging needs coordinated from definition through delivery.',
    items: ['Program design and coordination', 'Milestones, timelines, and dependencies', 'Partner and stakeholder alignment', 'Launch, transformation, and incubation support'],
  },
] as const;

export const values = [
  {
    id: 'simplicity', name: 'Simplicity', short: 'Complex information translated into usable decisions.',
    line: 'We translate complexity into information people can use.',
    receipts: ['The important conclusion comes first', 'Technical detail remains available without overwhelming the message', 'Reports end with decisions or actions where appropriate', 'Interfaces reflect the operation instead of exposing unnecessary complexity'],
  },
  {
    id: 'transparency', name: 'Transparency', short: 'You always know what is done, next, and blocked.',
    line: 'We make the state of the work visible to the people who depend on it.',
    receipts: ['Completed, next, blocked, and at-risk work are clearly distinguished', 'Decisions are documented with their reasoning', 'Known facts, assumptions, and unresolved questions are separated', 'Reporting is designed to be understood, not merely archived'],
  },
  {
    id: 'accountability', name: 'Accountability', short: 'Responsibilities and next actions have visible owners.',
    line: 'Every responsibility and next action should have a visible owner.',
    receipts: ['Workstreams have named owners', 'Escalation paths are understood before they are needed', 'Problems are communicated directly', 'Handoffs include context, responsibility, and a clear next action'],
  },
  {
    id: 'reliability', name: 'Reliability', short: 'Repeatable systems, defined cadences, and backup coverage.',
    line: 'We build repeatable systems around work that cannot depend on memory or heroics.',
    receipts: ['Critical work runs on a defined cadence', 'Responsibilities and deadlines are recorded', 'Important processes have documented procedures and backup coverage', 'Exceptions are surfaced early enough to act'],
  },
] as const;

export const proofMetrics = [
  { value: '1', label: 'Integrated ecosystem' },
  { value: '9', label: 'Agents supported' },
  { value: '30+', label: 'Active partnerships' },
] as const;

export const settlementLayers = [
  { name: 'Methodology', description: 'Definitions, responsibilities, calculation rules, review requirements, and operating standards.' },
  { name: 'Infrastructure', description: 'Data collection, calculation pipelines, validation tooling, and reliable production workflows.' },
  { name: 'Operations', description: 'A recurring cycle with owners, deadlines, dependencies, review, escalation, and follow-through.' },
  { name: 'Reporting', description: 'A clear view of current state, completed results, supporting evidence, and required next actions.' },
] as const;
