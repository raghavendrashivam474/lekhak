// src/domain/temporal/index.ts
//
// Public surface of the temporal domain.
// Future milestones will add: reconstruction, phases, turning-points, timeline.

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
