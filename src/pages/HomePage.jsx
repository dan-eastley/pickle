import { useState, useEffect, useCallback } from 'react'
import { LayersThree01, GitBranch01, CpuChip01 } from '@untitled-ui/icons-react'
import { DOMAINS, ABSTRACTIONS, FORMATS, DOMAIN_COLORS } from '../lib/artefacts'
import DomainIcon from '../components/ui/DomainIcon'
import FormatIcon from '../components/ui/FormatIcon'
import Button from '../components/ui/Button'
import Logo from '../components/ui/Logo'
import Illustration from '../components/ui/Illustration'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, CheckIcon, RobotIcon } from '../components/ui/icons'
import capabilityShot from '../assets/screenshots/capability-model.png'
import documentShot from '../assets/screenshots/vision-document.png'
import decisionShot from '../assets/screenshots/decision.png'
import catalogueShot from '../assets/screenshots/catalogue.png'
import processFlowShot from '../assets/screenshots/process-flow.png'
import wiringShot from '../assets/screenshots/wiring-diagram.png'
import solutionDesignShot from '../assets/screenshots/solution-design.png'
import matrixShot from '../assets/screenshots/all-pages/matrix.png'

const FEATURE_CARDS = [
  {
    icon: LayersThree01,
    title: 'Architecture as Code',
    what: 'Enterprise architecture stored as structured, version-controlled data: not documents or spreadsheets.',
    points: [
      'Architecture lives in a Git repository: versioned, auditable, and reviewable',
      'Every artefact is machine-readable JSON, validated against a schema',
      'Changes require a formal Decision Record: no undocumented drift',
      'Query, diff, and compare architecture state like source code',
    ],
    usp: 'Pickle gives you a structured, schema-validated architecture repository from day one.',
  },
  {
    icon: CpuChip01,
    title: 'Agentic AI Architecture',
    what: 'AI agents that actively participate in the process, analysing and validating changes alongside your architects.',
    points: [
      'Every decision is analysed across seven dimensions before it reaches a human',
      'Agents surface conflicts and gaps before a change reaches the review board',
      'Analysis is structured and traceable: not free-form commentary',
      'The human stays in the loop: AI informs, architects decide',
    ],
    usp: 'Pickle integrates Claude AI agents into the governance workflow: every decision gets automated analysis before it reaches your architects.',
  },
  {
    icon: GitBranch01,
    title: 'Architectural Governance',
    what: 'A governed, traceable process for changing your architecture: driven by Decision Records and enforced through code review.',
    points: [
      'Every change must be justified in an Architecture Decision Record',
      'ADRs capture intent, rationale, and analysis: not just the change',
      'Git history provides an immutable audit trail of every decision',
      'Strategy, principles and guardrails are codified, not just documented',
    ],
    usp: 'Pickle combines the rigour of decision records with the practicality of pull requests: governance that developers and architects can both live with.',
  },
]

// The seven analysis steps that run, in order, when a decision is proposed.
// Layer badges on the three alignment steps reinforce the meta model:
// Strategy / Principles / Guardrails ↔ Conceptual / Logical / Physical.
const ANALYSIS_DIMENSIONS = [
  {
    n: '01',
    name: 'Impact Assessment',
    question: 'What does this change actually touch?',
    text: 'Identifies the artefacts, domains and abstraction layers affected, the full blast radius of the decision.',
  },
  {
    n: '02',
    name: 'Referential Integrity',
    question: 'Does the model stay consistent?',
    text: 'Checks every reference, ID and index the change relies on, so the architecture model never silently breaks.',
  },
  {
    n: '03',
    name: 'Strategy Alignment',
    layer: 'Conceptual',
    question: 'Does it serve the strategy?',
    text: 'Tests the decision against each affected domain’s documented strategic goals, the what and why.',
  },
  {
    n: '04',
    name: 'Principles Alignment',
    layer: 'Logical',
    question: 'Does it follow the principles?',
    text: 'Assesses the decision against the architecture principles that guide how design choices are made.',
  },
  {
    n: '05',
    name: 'Guardrails Alignment',
    layer: 'Physical',
    question: 'Does it stay inside the guardrails?',
    text: 'Verifies compliance with each domain’s non-negotiable rules and minimum standards. A breach is a blocking issue.',
  },
  {
    n: '06',
    name: 'Proponent Analysis',
    question: 'What is the strongest case for?',
    text: 'An agent argues for the change at its best: benefits, opportunities, and the cost of not acting.',
  },
  {
    n: '07',
    name: 'Challenger Analysis',
    question: 'What is the strongest case against?',
    text: 'A second agent stress-tests the change for risks, gaps and unstated assumptions before a human ever has to.',
  },
]

const LAYER_BADGES = {
  Conceptual: 'bg-blue-100 text-blue-700',
  Logical: 'bg-amber-100 text-amber-700',
  Physical: 'bg-rose-100 text-rose-700',
}

// The solution document chain: each step adds detail and moves from
// conceptual to physical, with the audience shifting from exec to engineer.
const DOCUMENT_CHAIN = [
  {
    id: 'SOL-AVI',
    name: 'Architecture Visions',
    layer: 'Conceptual',
    audience: 'Executive & Enterprise Architect',
    adds: 'Strategic direction and the high-level target architecture.',
  },
  {
    id: 'SOL-AIN',
    name: 'Architecture Intents',
    layer: 'Conceptual',
    audience: 'Architecture Review Board',
    adds: 'The decided direction: options weighed and rationale recorded.',
  },
  {
    id: 'SOL-SVI',
    name: 'Solution Intents',
    layer: 'Logical',
    audience: 'Solution Architect',
    adds: 'Per-initiative problem, approach, capabilities and platforms: fixed and variable intent.',
  },
  {
    id: 'SOL-SDE',
    name: 'Solution Designs',
    layer: 'Logical',
    audience: 'Technical Architect & Engineering Lead',
    adds: 'Logical design across the four domains, NFRs and flows.',
  },
  {
    id: 'SOL-ISP',
    name: 'Interface Specs & LLDs',
    layer: 'Physical',
    audience: 'Technical Architect & Engineering Lead',
    adds: 'Concrete protocols, endpoints and contracts to build against.',
  },
]

const LAYER_ACCENT = {
  Conceptual: 'border-t-blue-500',
  Logical: 'border-t-amber-500',
  Physical: 'border-t-rose-500',
}

function DocumentChain() {
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
            The document chain
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            From vision to build, one step at a time
          </h2>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            Solution documents form a chain: each one elaborates the last. As you move along it,
            detail increases and the architecture moves from conceptual to physical, while the
            audience shifts from executives to engineers.
          </p>
        </div>

        {/* Pronounced layer track, the conceptual → logical → physical spine */}
        <div className="mb-6 grid grid-cols-3 gap-2 items-stretch">
          {[
            ['Conceptual', 'What & why · strategic', 'bg-blue-500'],
            ['Logical', 'How · design', 'bg-amber-500'],
            ['Physical', 'Where & with what · build', 'bg-rose-500'],
          ].map(([label, sub, bar], j) => (
            <div key={label} className="relative">
              <div className={`h-1.5 ${bar}`} />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{label}</span>
                {j < 2 && <ArrowRight className="w-4 h-4 text-gray-300" />}
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {DOCUMENT_CHAIN.map((doc, i) => (
            <div
              key={doc.id}
              className={`relative bg-white border border-gray-200 border-t-4 ${LAYER_ACCENT[doc.layer]} p-4 flex flex-col hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-300">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={`text-xs font-medium px-1.5 py-0.5 ${LAYER_BADGES[doc.layer]}`}>
                  {doc.layer}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900">{doc.name}</h3>
              <p className="text-xs font-mono text-gray-500 mt-0.5">{doc.id}</p>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed flex-1">{doc.adds}</p>
              <p className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
                <span className="font-medium text-gray-500">Audience:</span> {doc.audience}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Hero() {
  const { user } = useAuth()
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-brand-50 via-white to-gray-50 px-6 py-24">
      {/* Soft ambient glow for depth */}
      <div className="pointer-events-none absolute -top-32 -right-24 w-[28rem] h-[28rem] bg-brand-200/30 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 w-[28rem] h-[28rem] bg-rose-200/20 blur-3xl rounded-full" />
      <div className="relative z-10 max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <Logo align="left" size="lg" />
          <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 max-w-xl mx-auto lg:mx-0 leading-[1.05] tracking-tight">
            Making architecture{' '}
            <span className="bg-gradient-to-r from-brand-700 to-rose-600 bg-clip-text text-transparent">
              consumable
            </span>
            .
          </h1>
          <p className="mt-4 text-sm text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Pickle brings the user experience of a great product to enterprise architecture. Your
            model tells its own story — clear, navigable and understandable — so it takes an
            architect to <span className="font-semibold text-gray-900">build</span> it, not to read
            it. And it evolves at pace, within the right constraints.
          </p>
          {/* The strongest selling points, lifted to the top */}
          <ul className="mt-6 space-y-2 max-w-xl mx-auto lg:mx-0 text-left">
            {[
              [
                'Consumable by design',
                'Architecture that tells its own story — no architect required to read it.',
              ],
              [
                'A real user experience',
                'Built on commonality and common sense: continuity, consistency and understandability across every artefact.',
              ],
              [
                'Evolve at pace, in the guardrails',
                'Every change is a Decision Record, stress-tested by seven AI agents before a human decides. No undocumented drift.',
              ],
              [
                'Architecture as code',
                'Schema-validated JSON in Git — versioned, auditable, queryable, and aligned to TOGAF, SAFe, Zachman and UAF.',
              ],
            ].map(([h, t]) => (
              <li key={h} className="flex items-start gap-2.5 text-sm">
                <CheckIcon className="w-4 h-4 mt-0.5 text-brand-600 flex-shrink-0" />
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{h}</span>: {t}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center justify-center lg:justify-start gap-3">
            <Button to={user ? '/architectures' : '/register'} size="lg">
              {user ? 'View Architectures' : 'Get Started'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Real product window */}
        <div className="hidden lg:block border border-gray-200 shadow-2xl bg-white overflow-hidden">
          <img
            src={capabilityShot}
            alt="Pickle, the business capability model rendered as a diagram"
            className="w-full h-auto"
            loading="eager"
          />
        </div>
      </div>

      {/* Meta-model strip: five domains, three layers */}
      <div className="relative z-10 mt-16 max-w-2xl mx-auto text-center">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Five architecture domains · Three abstraction layers
        </p>
        <div className="mt-4 flex items-center justify-center gap-x-8 gap-y-3 flex-wrap">
          {DOMAINS.map((d) => (
            <span key={d.id} className="flex items-center gap-2 text-sm text-gray-500">
              <DomainIcon domain={d.id} className="w-4 h-4 text-gray-500" />
              {d.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCards() {
  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {FEATURE_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="bg-white border-l-4 border-brand-600 flex flex-col shadow-sm hover:shadow-xl transition-shadow duration-200"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="w-10 h-10 bg-brand-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{card.what}</p>
              </div>

              {/* Points */}
              <ul className="p-6 space-y-2 flex-1">
                {card.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-brand-400 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>

              {/* USP */}
              <div className="px-6 pb-6">
                <div className="bg-brand-50 border-l-2 border-brand-500 px-4 py-3">
                  <p className="text-sm font-semibold text-brand-700 leading-snug">{card.usp}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

const ABSTRACTION_META = {
  conceptual: {
    label: 'Conceptual',
    sub: 'The what & why',
    desc: 'Sets direction and intent: what the architecture needs to achieve and why, without any technology choices.',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    accent: 'border-l-blue-500',
  },
  logical: {
    label: 'Logical',
    sub: 'The how',
    desc: 'Defines the rules and principles that guide design decisions, without committing to any specific tool or product.',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    accent: 'border-l-amber-500',
  },
  physical: {
    label: 'Physical',
    sub: 'The where & with what',
    desc: 'Specifies the concrete standards and technology decisions that govern how the architecture is built and operated.',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    accent: 'border-l-rose-500',
  },
}

const FORMAT_META = {
  catalogue: {
    desc: 'A structured list of architecture entities of a single type: capabilities, processes, applications. Hierarchical, machine-readable, schema-validated.',
  },
  diagram: {
    desc: 'A visual representation of entities and their relationships: capability models, process flows, wiring diagrams. Derived from catalogue content and rendered by the UI.',
  },
  document: {
    desc: 'Structured narrative content with multiple named instances: vision documents, solution designs, interface specifications. Sections follow the JSON schema structure.',
  },
  matrix: {
    desc: 'A grid mapping relationships between two sets of entities: capabilities to platforms, interfaces to data concepts. Spans abstraction layers and domains.',
  },
}

function ArchitectureModel() {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        {/* Section header */}
        <div className="mb-12 flex items-start justify-between gap-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
              The architecture model
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Five domains · Three abstraction layers · Four output formats
            </h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Every piece of architecture content in Pickle sits at the intersection of these three
              axes. Domain answers "which part of the organisation", abstraction layer answers "how
              much detail", and format answers "what kind of content".
            </p>
          </div>
          <Illustration
            name="building-blocks"
            className="hidden xl:block w-72 flex-shrink-0 self-center"
          />
        </div>

        {/* Domains */}
        <div className="mb-12">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Architecture Domains
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {DOMAINS.map((domain) => {
              const colors = DOMAIN_COLORS[domain.id]
              return (
                <div
                  key={domain.id}
                  className={`border border-gray-200 border-l-4 bg-white p-5 flex flex-col gap-3 hover:shadow-md transition-shadow ${colors?.accent ?? 'border-l-gray-400'}`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${colors?.bg ?? 'bg-gray-100'}`}
                  >
                    <DomainIcon
                      domain={domain.id}
                      className={`w-4 h-4 ${colors?.text ?? 'text-gray-500'}`}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{domain.name}</div>
                    <div className={`text-xs font-mono mt-0.5 ${colors?.text ?? 'text-gray-500'}`}>
                      {domain.acronym}-*
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">
                    {domain.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Architecture Discovery CTA, the Virtual Architect Agent */}
          <div className="mt-4 border border-gray-200 border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50/60 to-rose-50/40 p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-700 to-rose-600 flex items-center justify-center flex-shrink-0">
              <RobotIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-gray-900">Architecture Discovery</div>
              <div className="text-xs font-medium text-blue-700">Virtual Architect Agent</div>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Ask a question and have the agent interrogate the architecture to produce a
                point-in-time view.
              </p>
            </div>
            <Button to="/architectures" variant="secondary" className="flex-shrink-0">
              Explore
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Abstraction Layers */}
        <div className="mb-12">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Abstraction Layers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ABSTRACTIONS.map((layer) => {
              const m = ABSTRACTION_META[layer.id]
              return (
                <div
                  key={layer.id}
                  className={`border ${m.border} border-l-4 ${m.accent} p-5 ${m.bg}`}
                >
                  <div className={`text-sm font-bold ${m.text}`}>{m.label}</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">{m.sub}</div>
                  <p className="mt-3 text-xs text-gray-600 leading-relaxed">{m.desc}</p>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">
            Layers are progressive: Logical artefacts build on Conceptual ones; Physical artefacts
            make Logical ones concrete. Relationships that cross layers are captured in{' '}
            <strong>Matrix</strong> artefact types.
          </p>
        </div>

        {/* Output Formats */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Output Formats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FORMATS.map((fmt) => {
              const m = FORMAT_META[fmt.id]
              return (
                <div
                  key={fmt.id}
                  className="border border-gray-200 bg-white p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-brand-50 flex-shrink-0">
                    <FormatIcon format={fmt.id} className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{fmt.label}</div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">{m.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function SevenDimensions() {
  return (
    <section className="border-y border-gray-200 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="flex items-start justify-between gap-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
              The analysis pipeline
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Every decision, analysed across seven dimensions
            </h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              When a decision is proposed, seven AI analysis steps run in sequence against the
              current architecture state. Each one writes structured findings, finding, impact,
              recommendation and rationale: into the Decision Record, for architects to accept or
              decline. Nothing merges until a human says so.
            </p>
          </div>
          <Illustration
            name="code-review"
            className="hidden xl:block w-72 flex-shrink-0 self-center"
          />
        </div>

        {/* Pipeline cards: numbered, in execution order */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ANALYSIS_DIMENSIONS.map((dim) => (
            <div
              key={dim.n}
              className="border border-gray-200 border-t-2 border-t-brand-600 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-gray-300">{dim.n}</span>
                {dim.layer && (
                  <span className={`text-xs font-medium px-1.5 py-0.5 ${LAYER_BADGES[dim.layer]}`}>
                    {dim.layer}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-gray-900">{dim.name}</h3>
              <p className="mt-1 text-xs font-medium text-brand-600">{dim.question}</p>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">{dim.text}</p>
            </div>
          ))}

          {/* Eighth tile, the human gate that closes the pipeline */}
          <div className="border border-dashed border-gray-300 bg-gray-50 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-gray-800 text-white flex items-center justify-center">
                <CheckIcon className="w-3 h-3" />
              </span>
              <h3 className="text-sm font-bold text-gray-900">Human review</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Architects review every finding, then accept, reject or return the decision. AI
              informs: people decide.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// The defining piece: architects author Strategy / Principles / Guardrails for
// every domain × layer. Everything else, and every AI analysis, is measured
// against them. Full-width, high-emphasis.
const FOUNDATION = [
  {
    name: 'Strategy',
    suffix: 'STR',
    layer: 'Conceptual',
    q: 'What & why',
    text: 'The outcomes the architecture must achieve, per domain. Sets direction for everything below.',
    bar: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Principles',
    suffix: 'PRN',
    layer: 'Logical',
    q: 'How we decide',
    text: 'The vendor-neutral rules that shape design choices, the architect’s guidance, codified.',
    bar: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    name: 'Guardrails',
    suffix: 'GRD',
    layer: 'Physical',
    q: 'What we never cross',
    text: 'The non-negotiable constraints and minimum standards. A breach blocks the change.',
    bar: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700',
  },
]

function FoundationArtefacts() {
  return (
    <section className="border-y border-gray-200 bg-gradient-to-br from-brand-700 to-rose-700 text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-white/70">
            The foundation: defined by your architects
          </p>
          <h2 className="text-2xl font-bold">Strategy, Principles &amp; Guardrails</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            These three artefacts are the spine of the whole model. Your{' '}
            <span className="font-semibold text-white">architects author them</span> for every
            domain, one per abstraction layer, and every other artefact, and every AI analysis step,
            is measured against them. This is where human judgement sets the rules; the agents only
            check that changes respect them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FOUNDATION.map((f) => (
            <div key={f.name} className="bg-white text-gray-900 shadow-xl flex flex-col">
              <div className={`h-1.5 ${f.bar}`} />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold">{f.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 ${f.badge}`}>{f.layer}</span>
                </div>
                <p className="text-xs font-mono text-gray-500 mb-2">&lt;DOMAIN&gt;-{f.suffix}</p>
                <p className="text-sm font-semibold text-brand-700 mb-1">{f.q}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{f.text}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-white/70">
          Five domains × three layers = <span className="font-semibold text-white">15</span>{' '}
          foundation artefacts that define the guardrails the rest of the architecture lives within.
        </p>
      </div>
    </section>
  )
}

// Up to 8 product screenshots spanning every aspect of Pickle.
const CAROUSEL = [
  {
    src: capabilityShot,
    title: 'Capability models as diagrams',
    desc: 'Hierarchical business capability and process models, rendered live from the repository.',
  },
  {
    src: catalogueShot,
    title: 'Models as structured data',
    desc: 'Capabilities, processes, data and platforms are schema-validated, queryable catalogues.',
  },
  {
    src: matrixShot,
    title: 'Relationships as matrices',
    desc: 'Capability-to-process, process-to-data (CRUD) and more, the edges of the architecture graph.',
  },
  {
    src: processFlowShot,
    title: 'Process & data flows',
    desc: 'Operating-model processes visualised end to end, generated from the catalogues.',
  },
  {
    src: wiringShot,
    title: 'Integration landscape',
    desc: 'Platform-to-platform wiring with the interfaces that flow across each connection.',
  },
  {
    src: documentShot,
    title: 'Architecture as documents',
    desc: 'Visions, intents and designs render as structured, navigable documents.',
  },
  {
    src: solutionDesignShot,
    title: 'Low-level design',
    desc: 'Solution designs and interface specs: concrete enough for engineers to build against.',
  },
  {
    src: decisionShot,
    title: 'Every change, AI-analysed',
    desc: 'A decision runs a seven-step analysis pipeline before a human accepts or declines it.',
  },
]

function ProductCarousel() {
  const [i, setI] = useState(0)
  const n = CAROUSEL.length
  const go = useCallback((d) => setI((p) => (p + d + n) % n), [n])

  // Auto-advance, paused on hover (via the paused flag).
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setI((p) => (p + 1) % n), 5000)
    return () => clearInterval(t)
  }, [paused, n])

  const slide = CAROUSEL[i]
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="max-w-3xl mb-8">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
            See it in action
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            A working architecture repository, not slideware
          </h2>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            Every artefact is live, structured, and rendered directly from the Git repository.
          </p>
        </div>

        <div
          className="relative bg-white border border-gray-200 shadow-xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden">
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.title}
              className="w-full h-auto block"
              loading="lazy"
            />
          </div>

          {/* Caption bar */}
          <div className="flex items-center justify-between gap-4 border-t border-gray-200 px-5 py-3">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">{slide.title}</h3>
              <p className="text-xs text-gray-500 truncate">{slide.desc}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => go(-1)}
                aria-label="Previous screenshot"
                className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next screenshot"
                className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {CAROUSEL.map((s, j) => (
            <button
              key={s.title}
              onClick={() => setI(j)}
              aria-label={`Go to ${s.title}`}
              aria-current={j === i}
              className={`h-1.5 transition-all ${j === i ? 'w-6 bg-brand-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Positive alignment bullets only: sales call-outs, a tick is enough.
const FRAMEWORKS = [
  {
    name: 'TOGAF',
    sub: 'ADM',
    className: 'bg-sky-700 text-white',
    blurb: 'A TOGAF Architecture Repository, as code.',
    points: [
      'Architecture Repository as versioned data',
      'Business · Data · Application domains',
      'ADR-driven change management & governance',
      'Building blocks across abstraction layers',
    ],
  },
  {
    name: 'SAFe',
    sub: '6.0',
    className: 'bg-indigo-700 text-white',
    blurb: 'A SAFe Solution Intent store.',
    points: [
      'Solution Intent, the document chain',
      'Architectural enablers as Decision Records',
      'Capabilities & features',
      'PI / release baselines as transitions',
    ],
  },
  {
    name: 'Zachman',
    sub: '3.0',
    className: 'bg-teal-700 text-white',
    blurb: 'The interrogatives, as a model.',
    points: [
      'What → Data domains & concepts',
      'How → Business processes',
      'Why → Strategy & principles',
      'Perspectives → Conceptual / Logical / Physical',
    ],
  },
  {
    name: 'UAF',
    sub: '1.2',
    className: 'bg-rose-700 text-white',
    blurb: 'The model kinds, as formats.',
    points: [
      'Taxonomy → Catalogues',
      'Connectivity & Traceability → Matrices',
      'Structure & Processes → Diagrams',
      'Operational domains → the five domains',
    ],
  },
]

function FrameworkWordmark({ name, sub, className }) {
  return (
    <span
      className={`inline-flex items-baseline gap-1 px-2.5 py-1 text-sm font-bold tracking-tight ${className}`}
    >
      {name}
      {sub && <span className="text-[10px] font-semibold opacity-70 tracking-wider">{sub}</span>}
      <span className="text-[10px] font-normal opacity-70 align-super">®</span>
    </span>
  )
}

function FrameworkSupport() {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
            Works with your framework
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            Aligned to TOGAF, SAFe, Zachman &amp; UAF
          </h2>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            Pickle isn’t a rival method: it’s the repository the methods you already use are crying
            out for. Its domains, layers, and formats map straight onto the frameworks your
            architects work in.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FRAMEWORKS.map((fw) => (
            <div
              key={fw.name}
              className="bg-white border-l-4 border-brand-600 shadow-sm p-6 flex flex-col"
            >
              <FrameworkWordmark name={fw.name} sub={fw.sub} className={fw.className} />
              <p className="mt-3 text-sm font-medium text-gray-600 leading-relaxed">{fw.blurb}</p>
              <ul className="mt-4 space-y-2">
                {fw.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckIcon className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ClosingCta() {
  const { user } = useAuth()
  return (
    <section className="px-6 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900">
        Architecture your whole team can actually use.
      </h2>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
        Browse a worked architecture and the governed decision workflow behind it — and see what
        consumable, evolving architecture feels like.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button to={user ? '/architectures' : '/register'} size="lg">
          {user ? 'View Architectures' : 'Get Started'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </section>
  )
}

const AGENT_BULLETS = [
  'Ask questions in plain language, the agent reads the architecture as structured data, not screenshots.',
  'Produces point-in-time views: dependency traces, impact maps, and gap analyses scoped to a domain or artefact.',
  'Every discovery is captured as a record: title, context, and request, so the question and its answer are versioned.',
  'Active and archived pots keep live investigations separate from historical ones.',
]

function VirtualArchitectAgent() {
  return (
    <section className="border-y border-gray-200 bg-gradient-to-br from-blue-50/50 via-white to-rose-50/40">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="flex items-start justify-between gap-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
              Virtual Architect Agent
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Architecture Discovery: interrogate your architecture
            </h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Discovery turns the repository into something you can question. Raise a discovery, and
              the Virtual Architect Agent reads the model to answer it, producing a view you can
              keep.
            </p>
            <ul className="mt-6 space-y-3">
              {AGENT_BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckIcon className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span className="min-w-0">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden xl:flex w-40 h-40 flex-shrink-0 self-center bg-gradient-to-br from-brand-700 to-rose-600 items-center justify-center">
            <RobotIcon className="w-20 h-20 text-white" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div>
      <Hero />
      <ProductCarousel />
      <FeatureCards />
      <ArchitectureModel />
      <FoundationArtefacts />
      <DocumentChain />
      <SevenDimensions />
      <FrameworkSupport />
      <VirtualArchitectAgent />
      <ClosingCta />
    </div>
  )
}
