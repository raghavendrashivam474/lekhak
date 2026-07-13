// src/domain/temporal/index.ts
//
// Public surface of the temporal domain.

export type {
  TemporalEntityType,
  TemporalEventType,
  TemporalEvent,
  CreateTemporalEventInput,
} from "./types";

export {
  normaliseIntentValue,
  isMeaningfulTextChange,
  resolveQuestionTemporalEvent,
} from "./events";

export type { LifecycleStatus } from "./events";

export {
  resolveProjectPhase,
  findPhaseTransitions,
} from "./phases";

export type {
  ProjectPhase,
  ProjectPhaseSignal,
  ProjectPhaseResult,
  PhaseResolverInput,
} from "./phases";

export { detectTurningPoints } from "./turning-points";

export type {
  TurningPointType,
  TurningPoint,
  TurningPointInput,
} from "./turning-points";

export {
  reconstructIntentAt,
  reconstructQuestionsAt,
  reconstructRelationshipsAt,
} from "./reconstruction";

export type {
  TemporalSnapshot,
  ReconstructedIntent,
  ReconstructedQuestion,
  ReconstructedRelationship,
} from "./reconstruction";

export { buildEvolutionTimeline } from "./timeline";

export type {
  EvolutionTimelineItem,
  EvolutionTimelineItemType,
  BuildTimelineInput,
} from "./timeline";
