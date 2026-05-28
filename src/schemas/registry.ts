import { type ZodType } from 'zod';
import { schemas } from './buyer';
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  CreateAdvertiserInput,
  UpdateAdvertiserInput,
} from '../types';

function typed<T>(schema: unknown): ZodType<T> {
  return schema as ZodType<T>;
}

export const advertiserSchemas = {
  createInput: typed<CreateAdvertiserInput>(schemas.CreateAdvertiserBody),
  updateInput: typed<UpdateAdvertiserInput>(schemas.UpdateAdvertiserBody),
};

export const campaignSchemas = {
  createInput: typed<CreateCampaignInput>(schemas.CreateCampaignBody),
  updateInput: typed<UpdateCampaignInput>(schemas.UpdateCampaignBody),
  executeInput: schemas.ExecuteCampaignBody,
  response: typed<Campaign>(schemas.Campaign),
  listResponse: schemas.CampaignListResponse,
  statusChangeResponse: schemas.CampaignStatusChangeResponse,
};

export const discoverySchemas = {
  discoverInput: schemas.DiscoverProductsBody,
  discoverResponse: schemas.DiscoverProductsResponse,
  addProductsInput: schemas.AddProductsRequest,
  removeProductsInput: schemas.RemoveProductsRequest,
  sessionProductsResponse: schemas.SessionProductsResponse,
};

export const reportingSchemas = {
  response: schemas.ReportingMetricsResponse,
};
