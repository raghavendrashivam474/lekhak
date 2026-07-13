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
