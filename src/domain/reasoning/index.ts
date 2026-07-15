// src/domain/reasoning/index.ts
//
// Public surface of the creative reasoning domain.
// Pure functions only. No IO.

// Types
export type {
  CreativeThread,
  IntentThreadLink,
  ThreadDerivation,
  ThreadDerivationMethod,
  ThreadResolverInput,
  ThreadNote,
  ThreadRelationship,
  ThreadQuestion,
  ThreadIntentLink,
  ThreadCollection,
  ThreadTag,
  ThreadNoteTag,
  ThreadProgress,
  ProgressFactor,
  ProjectNarrativeProgress,
  DependencyNodeType,
  DependencyNode,
  DependencyEdge,
  DependencyGraph,
  Blocker,
  DependencyAnalysis,
  CreativeHealthMetric,
  CreativeHealth,
  ReasoningRuleId,
  InsightSeverity,
  ReasoningEvidence,
  ReasoningInsight,
  ReasoningContext,
  ReasoningResult,
} from "./types";

// Thread resolution
export { resolveCreativeThreads } from "./threads";

// Narrative progress
export {
  calculateThreadProgress,
  calculateProjectNarrativeProgress,
} from "./progress";

// Dependencies
export {
  buildDependencyGraph,
  detectBlockers,
  analyzeDependencies,
} from "./dependencies";

// Creative health
export { calculateCreativeHealth } from "./health";

// Reasoning engine
export { analyzeProject } from "./engine";
