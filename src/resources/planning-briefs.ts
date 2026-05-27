import { type BaseAdapter, validateResourceId } from '../adapters/base';
import type {
  PlanningBrief,
  CreatePlanningBriefInput,
  PlanningBriefResponse,
  ApiResponse,
  PaginatedApiResponse,
} from '../types';

/**
 * Resource for managing planning briefs
 */
export class PlanningBriefsResource {
  constructor(private readonly adapter: BaseAdapter) {}

  /**
   * List all planning briefs
   * @returns Paginated list of planning briefs
   */
  async list(): Promise<PaginatedApiResponse<PlanningBrief>> {
    return this.adapter.request<PaginatedApiResponse<PlanningBrief>>('GET', '/planning-briefs');
  }

  /**
   * Create a new planning brief
   * @param data Planning brief creation data
   * @returns Created planning brief
   */
  async create(data: CreatePlanningBriefInput): Promise<ApiResponse<PlanningBrief>> {
    return this.adapter.request<ApiResponse<PlanningBrief>>('POST', '/planning-briefs', data);
  }

  /**
   * Get a planning brief by ID
   * @param briefId Planning brief ID
   * @returns Planning brief details
   */
  async get(briefId: string): Promise<ApiResponse<PlanningBrief>> {
    return this.adapter.request<ApiResponse<PlanningBrief>>(
      'GET',
      `/planning-briefs/${validateResourceId(briefId)}`
    );
  }

  /**
   * List responses for a planning brief
   * @param briefId Planning brief ID
   * @returns Paginated list of responses
   */
  async listResponses(briefId: string): Promise<PaginatedApiResponse<PlanningBriefResponse>> {
    return this.adapter.request<PaginatedApiResponse<PlanningBriefResponse>>(
      'GET',
      `/planning-briefs/${validateResourceId(briefId)}/responses`
    );
  }
}
