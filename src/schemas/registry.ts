import { schemas } from './buyer';

export const advertiserSchemas = {
  createInput: schemas.CreateAdvertiserBody,
  updateInput: schemas.UpdateAdvertiserBody,
};

export const campaignSchemas = {
  createInput: schemas.CreateCampaignBody,
  updateInput: schemas.UpdateCampaignBody,
  executeInput: schemas.ExecuteCampaignBody,
  response: schemas.Campaign,
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

export const salesAgentSchemas = {
  registerAccountInput: schemas.RegisterSalesAgentAccountBody,
  response: schemas.Agent,
  listResponse: schemas.AgentList,
  accountResponse: schemas.AgentAccount,
};
