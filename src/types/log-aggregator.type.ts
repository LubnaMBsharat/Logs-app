import { CommonFilters } from "./log-common.type.js";

export interface LogAggregator extends CommonFilters {
  since: string;
  until: string;
  bucket: '1m' | '5m' | '1h' | '1d';
  group_by?: 'service' | 'level';
}
export const VALID_BUCKETS = new Set(['1m', '5m', '1h', '1d']);
export const VALID_GROUPS = new Set(['service', 'level']);