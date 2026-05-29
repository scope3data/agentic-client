/* eslint-disable */
// Auto-generated from OpenAPI spec - DO NOT EDIT

import { z } from 'zod';

const AdvertiserSummary = z.object({
  id: z.string(),
  name: z.string(),
  Status: z.enum(['ACTIVE', 'ARCHIVED']),
  sandbox: z.boolean(),
  brand: z.string().optional(),
  primaryCurrency: z
    .string()
    .min(3)
    .max(3)
    .regex(/^[A-Z]{3}$/),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  linkedAccountCount: z.number().int().gte(0).lte(9007199254740991),
});
const AdvertiserListResponse = z.object({
  items: z.array(AdvertiserSummary),
  total: z.number().int().gte(0).lte(9007199254740991),
  hasMore: z.boolean(),
  nextOffset: z.number().int().gte(0).lte(9007199254740991).nullable(),
});
const ApiError = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  details: z.object({}).partial().passthrough().optional(),
});
const ErrorResponse = z.object({ data: z.literal(null).nullable(), error: ApiError });
const LinkedAccountInput = z
  .object({
    storefrontId: z.number().int().lte(9007199254740991),
    sourceId: z.string().min(1),
    accountId: z.string().min(1),
    billingType: z.string().optional(),
  })
  .passthrough();
const OptimizationApplyMode = z.enum(['AUTO', 'MANUAL']);
const CampaignBudgetType = z.literal('total_budget');
const GcsCredentialConfig = z
  .object({
    type: z.literal('GCS'),
    bucket: z
      .string()
      .min(1)
      .max(222)
      .regex(/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/),
  })
  .passthrough();
const S3CredentialConfig = z
  .object({
    type: z.literal('S3'),
    bucket: z
      .string()
      .min(3)
      .max(63)
      .regex(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/),
    region: z.string().regex(/^[a-z]{2}(-[a-z]+)+-\d+$/),
  })
  .passthrough();
const AzureBlobSasAuthInput = z
  .object({ mode: z.literal('SAS_TOKEN'), sasToken: z.string().min(1).max(4096) })
  .passthrough();
const AzureBlobAuthInput = AzureBlobSasAuthInput;
const AzureBlobCredentialConfigInput = z
  .object({
    type: z.literal('AZURE_BLOB'),
    storageAccountName: z
      .string()
      .min(3)
      .max(24)
      .regex(/^[a-z0-9]+$/),
    containerName: z
      .string()
      .min(3)
      .max(63)
      .regex(/^(?!.*--)[a-z0-9][a-z0-9-]*[a-z0-9]$/),
    auth: AzureBlobAuthInput,
  })
  .passthrough();
const CredentialConfigInput = z.discriminatedUnion('type', [
  GcsCredentialConfig,
  S3CredentialConfig,
  AzureBlobCredentialConfigInput,
]);
const DataDeliveryCredentialInput = z
  .object({
    name: z
      .string()
      .min(1)
      .max(64)
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/),
    config: CredentialConfigInput,
  })
  .passthrough();
const DataDeliveryCredentialArrayInput = z.array(DataDeliveryCredentialInput);
const GcsDeliveryConfig = z
  .object({
    type: z.literal('GCS'),
    pathPrefix: z.string().max(1024).optional().default(''),
    format: z.enum(['JSONL', 'PARQUET', 'CSV']).optional().default('JSONL'),
  })
  .passthrough();
const S3DeliveryConfig = z
  .object({
    type: z.literal('S3'),
    pathPrefix: z.string().max(1024).optional().default(''),
    format: z.enum(['JSONL', 'PARQUET', 'CSV']).optional().default('JSONL'),
  })
  .passthrough();
const AzureBlobDeliveryConfig = z
  .object({
    type: z.literal('AZURE_BLOB'),
    pathPrefix: z.string().max(1024).optional().default(''),
    format: z.enum(['JSONL', 'PARQUET', 'CSV']).optional().default('JSONL'),
  })
  .passthrough();
const DeliveryConfig = z.discriminatedUnion('type', [
  GcsDeliveryConfig,
  S3DeliveryConfig,
  AzureBlobDeliveryConfig,
]);
const DataDeliveryOutputInput = z
  .object({
    dataDeliveryType: z.enum([
      'MB_DELIVERY',
      'IMPRESSIONS',
      'CLICKS',
      'VAST_EVENTS',
      'CAPI_ATTRIBUTION',
      'MMP_POSTBACKS',
    ]),
    cadence: z.enum(['HOURLY', 'DAILY', 'WEEKLY']),
    syncWeeklyDay: z.number().int().gte(0).lte(6).optional(),
    enabled: z.boolean().optional().default(true),
    credentialName: z
      .string()
      .min(1)
      .max(64)
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/),
    deliveryConfig: DeliveryConfig,
  })
  .passthrough();
const DataDeliveryOutputArrayInput = z.array(DataDeliveryOutputInput);
const AdvertiserDataDeliveryInput = z
  .object({ credentials: DataDeliveryCredentialArrayInput, outputs: DataDeliveryOutputArrayInput })
  .partial()
  .passthrough();
const CreateAdvertiserBody = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    brand: z.string().min(1),
    saveBrand: z.boolean().optional().default(false),
    linkedAccounts: z.array(LinkedAccountInput).optional(),
    optimizationApplyMode: OptimizationApplyMode.optional(),
    campaignBudgetType: CampaignBudgetType.optional(),
    primaryCurrency: z
      .string()
      .min(3)
      .max(3)
      .regex(/^[A-Za-z]{3}$/)
      .optional(),
    sandbox: z.boolean().optional().default(false),
    utmConfig: z
      .array(
        z
          .object({
            paramKey: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
            paramValue: z.string().min(1).max(200),
          })
          .passthrough()
      )
      .max(20)
      .optional(),
    dataDelivery: AdvertiserDataDeliveryInput.optional(),
    frequencyCaps: z
      .array(
        z
          .object({
            max_impressions: z.number().int().lte(9007199254740991),
            window: z
              .object({
                interval: z.number().gte(1),
                unit: z.union([
                  z.literal('seconds'),
                  z.literal('minutes'),
                  z.literal('hours'),
                  z.literal('days'),
                  z.literal('campaign'),
                ]),
              })
              .passthrough(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();
const BrandManifestJson = z
  .object({
    name: z.string().min(1).max(500),
    url: z.string().url().optional(),
    logos: z
      .array(
        z
          .object({
            url: z.string().url(),
            tags: z.array(z.string()).optional(),
            width: z.number().int().lte(9007199254740991).optional(),
            height: z.number().int().lte(9007199254740991).optional(),
          })
          .passthrough()
      )
      .optional(),
    colors: z
      .object({
        primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      })
      .partial()
      .passthrough()
      .optional(),
    fonts: z
      .union([
        z
          .object({
            primary: z.string(),
            secondary: z.string(),
            fontUrls: z.array(z.string().url()),
          })
          .partial()
          .passthrough(),
        z.array(z.object({ name: z.string(), role: z.string().optional() }).passthrough()),
      ])
      .optional(),
    tone: z.string().max(2000).optional(),
    tagline: z.string().max(500).optional(),
    assets: z
      .array(
        z
          .object({
            assetId: z.string(),
            assetType: z.string(),
            url: z.string().url(),
            name: z.string().optional(),
            description: z.string().optional(),
            tags: z.array(z.string()).optional(),
            width: z.number().int().lte(9007199254740991).optional(),
            height: z.number().int().lte(9007199254740991).optional(),
            durationSeconds: z.number().gt(0).optional(),
            fileSizeBytes: z.number().int().lte(9007199254740991).optional(),
            format: z.string().optional(),
            metadata: z.object({}).partial().passthrough().optional(),
          })
          .passthrough()
      )
      .optional(),
    productCatalog: z
      .object({
        feedUrl: z.string().url(),
        feedFormat: z.enum(['google_merchant_center', 'facebook_catalog', 'custom']).optional(),
        categories: z.array(z.string()).optional(),
        lastUpdated: z.string().datetime({ offset: true }).optional(),
        updateFrequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']).optional(),
      })
      .passthrough()
      .optional(),
    disclaimers: z
      .array(
        z
          .object({
            text: z.string(),
            context: z.string().optional(),
            required: z.boolean().default(true),
          })
          .passthrough()
      )
      .optional(),
    industry: z.string().max(255).optional(),
    targetAudience: z.string().max(1000).optional(),
    contact: z
      .object({
        email: z
          .string()
          .regex(
            /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/
          )
          .email(),
        phone: z.string(),
        website: z.string().url(),
      })
      .partial()
      .passthrough()
      .optional(),
    metadata: z
      .object({
        createdDate: z.string().datetime({ offset: true }),
        updatedDate: z.string().datetime({ offset: true }),
        version: z.string(),
      })
      .partial()
      .passthrough()
      .optional(),
  })
  .passthrough();
const BuyerCredentialSourceRef = z.object({
  storefrontId: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  storefrontName: z.string(),
  sourceId: z.string(),
  sourceName: z.string(),
});
const LinkedAccount = z.object({
  linkId: z.string(),
  accountId: z.string(),
  name: z.string().nullable(),
  sources: z.array(BuyerCredentialSourceRef),
  Status: z.string(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
const GcsCredentialConfigOutput = z.object({
  type: z.literal('GCS'),
  bucket: z
    .string()
    .min(1)
    .max(222)
    .regex(/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/),
});
const S3CredentialConfigOutput = z.object({
  type: z.literal('S3'),
  bucket: z
    .string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/),
  region: z.string().regex(/^[a-z]{2}(-[a-z]+)+-\d+$/),
});
const AzureBlobSasAuthStored = z.object({ mode: z.literal('SAS_TOKEN') });
const AzureBlobAuthStored = AzureBlobSasAuthStored;
const AzureBlobCredentialConfig = z.object({
  type: z.literal('AZURE_BLOB'),
  storageAccountName: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9]+$/),
  containerName: z
    .string()
    .min(3)
    .max(63)
    .regex(/^(?!.*--)[a-z0-9][a-z0-9-]*[a-z0-9]$/),
  auth: AzureBlobAuthStored,
});
const CredentialConfig = z.discriminatedUnion('type', [
  GcsCredentialConfigOutput,
  S3CredentialConfigOutput,
  AzureBlobCredentialConfig,
]);
const DataDeliveryCredential = z.object({
  credentialId: z.string(),
  name: z.string(),
  destinationType: z.enum(['GCS', 'S3', 'AZURE_BLOB', 'SNOWFLAKE', 'DATABRICKS']),
  config: CredentialConfig,
  Status: z.enum(['PENDING', 'VALIDATED', 'FAILED']),
  statusError: z.string().optional(),
  validatedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const GcsDeliveryConfigOutput = z.object({
  type: z.literal('GCS'),
  pathPrefix: z.string().max(1024).default(''),
  format: z.enum(['JSONL', 'PARQUET', 'CSV']).default('JSONL'),
});
const S3DeliveryConfigOutput = z.object({
  type: z.literal('S3'),
  pathPrefix: z.string().max(1024).default(''),
  format: z.enum(['JSONL', 'PARQUET', 'CSV']).default('JSONL'),
});
const AzureBlobDeliveryConfigOutput = z.object({
  type: z.literal('AZURE_BLOB'),
  pathPrefix: z.string().max(1024).default(''),
  format: z.enum(['JSONL', 'PARQUET', 'CSV']).default('JSONL'),
});
const DeliveryConfigOutput = z.discriminatedUnion('type', [
  GcsDeliveryConfigOutput,
  S3DeliveryConfigOutput,
  AzureBlobDeliveryConfigOutput,
]);
const DataDeliveryOutput = z.object({
  outputConfigId: z.string(),
  dataDeliveryType: z.enum([
    'MB_DELIVERY',
    'IMPRESSIONS',
    'CLICKS',
    'VAST_EVENTS',
    'CAPI_ATTRIBUTION',
    'MMP_POSTBACKS',
  ]),
  cadence: z.enum(['HOURLY', 'DAILY', 'WEEKLY']),
  syncWeeklyDay: z.number().int().gte(0).lte(6).optional(),
  enabled: z.boolean(),
  credentialId: z.string(),
  credentialName: z.string(),
  deliveryConfig: DeliveryConfigOutput,
  source: z.enum(['advertiser', 'campaign']),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const AdvertiserDataDelivery = z
  .object({ credentials: z.array(DataDeliveryCredential), outputs: z.array(DataDeliveryOutput) })
  .partial();
const FrequencyCapTargetLevel = z.enum(['ADVERTISER', 'CAMPAIGN', 'CREATIVE']);
const Advertiser = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  Status: z.enum(['ACTIVE', 'ARCHIVED']),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  linkedBrand: z
    .object({
      id: z.string(),
      name: z.string(),
      domain: z.string(),
      manifest: BrandManifestJson,
      logoUrl: z.string().optional(),
      industry: z.string().optional(),
      colors: z.record(z.string()).optional(),
      tagline: z.string().optional(),
      tone: z.string().optional(),
    })
    .optional(),
  brand: z.string().optional(),
  brandWarning: z.string().optional(),
  sandbox: z.boolean(),
  optimizationApplyMode: OptimizationApplyMode,
  campaignBudgetType: CampaignBudgetType,
  primaryCurrency: z
    .string()
    .min(3)
    .max(3)
    .regex(/^[A-Z]{3}$/),
  linkedAccounts: z.array(LinkedAccount).optional(),
  utmConfig: z
    .array(
      z.object({
        paramKey: z.string(),
        paramValue: z.string(),
        source: z.enum(['seat', 'campaign']),
      })
    )
    .optional(),
  dataDelivery: AdvertiserDataDelivery.optional(),
  frequencyCaps: z
    .array(
      z
        .object({
          max_impressions: z.number().int().lte(9007199254740991),
          window: z
            .object({
              interval: z.number().gte(1),
              unit: z.union([
                z.literal('seconds'),
                z.literal('minutes'),
                z.literal('hours'),
                z.literal('days'),
                z.literal('campaign'),
              ]),
            })
            .passthrough(),
          id: z.string(),
          targetLevel: FrequencyCapTargetLevel,
          targetId: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
          archivedAt: z.string().nullish(),
        })
        .passthrough()
    )
    .optional(),
});
const UpdateAdvertiserBody = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000),
    brand: z.string().min(1),
    linkedAccounts: z.array(LinkedAccountInput),
    optimizationApplyMode: OptimizationApplyMode,
    campaignBudgetType: CampaignBudgetType,
    primaryCurrency: z
      .string()
      .min(3)
      .max(3)
      .regex(/^[A-Za-z]{3}$/),
    utmConfig: z
      .array(
        z
          .object({
            paramKey: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
            paramValue: z.string().min(1).max(200),
          })
          .passthrough()
      )
      .max(20),
    dataDelivery: z
      .object({
        credentials: DataDeliveryCredentialArrayInput,
        outputs: DataDeliveryOutputArrayInput,
      })
      .partial()
      .passthrough(),
    frequencyCaps: z.array(
      z
        .object({
          max_impressions: z.number().int().lte(9007199254740991),
          window: z
            .object({
              interval: z.number().gte(1),
              unit: z.union([
                z.literal('seconds'),
                z.literal('minutes'),
                z.literal('hours'),
                z.literal('days'),
                z.literal('campaign'),
              ]),
            })
            .passthrough(),
        })
        .passthrough()
    ),
  })
  .partial()
  .passthrough();
const RevalidateDataDeliveryCredentialResponse = z.object({ credential: DataDeliveryCredential });
const DiscoveryRefinementItem = z.union([
  z.object({ scope: z.literal('request'), ask: z.string().min(1).max(2000) }).passthrough(),
  z
    .object({
      scope: z.literal('product'),
      id: z.string().min(1),
      action: z.enum(['include', 'omit', 'more_like_this']),
      ask: z.string().max(2000).optional(),
    })
    .passthrough(),
  z
    .object({
      scope: z.literal('proposal'),
      id: z.string().min(1),
      action: z.enum(['include', 'omit', 'finalize']),
      ask: z.string().max(2000).optional(),
    })
    .passthrough(),
]);
const DiscoverProductsBody = z
  .object({
    advertiserId: z.number().int().lte(9007199254740991),
    discoveryId: z.string().optional(),
    campaignId: z.string().optional(),
    proposalCode: z.string().optional(),
    channels: z.array(z.enum(['display', 'olv', 'ctv', 'social', 'video'])).optional(),
    countries: z
      .array(z.string().regex(/^[A-Z]{2}$/))
      .max(250)
      .optional(),
    brief: z.string().max(5000).optional(),
    budget: z.number().gt(0).optional(),
    flightDates: z
      .object({
        startDate: z.string().datetime({ offset: true }),
        endDate: z.string().datetime({ offset: true }),
      })
      .passthrough()
      .optional(),
    publisherDomain: z.string().min(1).optional(),
    pricingModel: z.enum(['cpm', 'vcpm', 'cpc', 'cpcv', 'cpv', 'cpp', 'flat_rate']).optional(),
    StorefrontIds: z.array(z.number().int().lte(9007199254740991)).max(50).optional(),
    StorefrontNames: z.array(z.string().max(255)).max(50).optional(),
    groupLimit: z.number().int().lte(10).optional().default(10),
    groupOffset: z.number().int().gte(0).lte(9007199254740991).optional().default(0),
    productsPerGroup: z.number().int().lte(15).optional().default(10),
    productOffset: z.number().int().gte(0).lte(1000).optional().default(0),
    Debug: z.boolean().optional(),
    refine: z.array(DiscoveryRefinementItem).min(1).max(100).optional(),
  })
  .passthrough();
const ProductCardData = z.object({
  formatId: z.object({ agentUrl: z.string(), id: z.string() }),
  manifest: z.object({}).partial().passthrough(),
});
const PricingOptionData = z
  .object({
    pricingOptionId: z.string(),
    pricingModel: z.string(),
    isFixed: z.boolean(),
    rate: z.number(),
    floorPrice: z.number(),
    fixedPrice: z.number(),
    currency: z.string(),
    priceGuidance: z
      .object({
        floor: z.number().nullable(),
        p25: z.number().nullable(),
        p50: z.number().nullable(),
        p75: z.number().nullable(),
        p90: z.number().nullable(),
      })
      .partial(),
  })
  .partial();
const Product = z.object({
  productId: z.string(),
  name: z.string(),
  channel: z.string().optional(),
  formatTypes: z.array(z.string()).optional(),
  cpm: z.number().optional(),
  salesAgentId: z.string().optional(),
  salesAgentName: z.string().optional(),
  storefrontId: z.string().optional(),
  storefrontName: z.string().optional(),
  description: z.string().optional(),
  deliveryType: z.enum(['guaranteed', 'non_guaranteed']).optional(),
  briefRelevance: z.string().optional(),
  productCard: ProductCardData.optional(),
  productCardDetailed: ProductCardData.optional(),
  pricingOptions: z.array(PricingOptionData).optional(),
  estimatedExposures: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
  forecast: z.object({}).partial().passthrough().optional(),
  bookability: z.string().optional(),
  publisherProperties: z
    .array(
      z
        .object({
          publisherDomain: z.string(),
          propertyType: z.string(),
          name: z.string(),
          selectionType: z.string(),
          identifiers: z.array(z.object({}).partial().passthrough()),
        })
        .partial()
    )
    .optional(),
  isSandbox: z.boolean().optional(),
});
const ProductGroup = z.object({
  groupId: z.string(),
  groupName: z.string(),
  description: z.string().optional(),
  products: z.array(Product),
  productCount: z.number().int().gte(0).lte(9007199254740991),
  totalProducts: z.number().int().gte(0).lte(9007199254740991),
  hasMoreProducts: z.boolean(),
});
const DiscoverySummary = z.object({
  totalProducts: z.number().int().gte(0).lte(9007199254740991),
  publishersCount: z.number().int().gte(0).lte(9007199254740991),
  priceRange: z
    .object({ min: z.number().nullable(), max: z.number().nullable(), avg: z.number().nullable() })
    .optional(),
});
const BudgetContextResponse = z.object({
  sessionBudget: z.number().nullable(),
  allocatedBudget: z.number(),
  remainingBudget: z.number().nullable(),
  budgetWarning: z.string().optional(),
});
const ProductAllocation = z.object({
  productId: z.string(),
  allocationPercentage: z.number().gte(0).lte(100),
  pricingOptionId: z.string().optional(),
  rationale: z.string().optional(),
  sequence: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
  tags: z.array(z.string()).optional(),
});
const Proposal = z.object({
  proposalId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  briefAlignment: z.string().optional(),
  salesAgentId: z.string().optional(),
  salesAgentName: z.string().optional(),
  storefrontId: z.string().optional(),
  storefrontName: z.string().optional(),
  allocations: z.array(ProductAllocation).min(1),
  expiresAt: z.string().optional(),
  totalBudgetGuidance: z
    .object({ min: z.number(), recommended: z.number(), max: z.number(), currency: z.string() })
    .partial()
    .optional(),
});
const AgentDebugLog = z
  .object({
    timestamp: z.string(),
    type: z.string(),
    message: z.string(),
    request: z.object({}).partial().passthrough(),
    response: z.object({}).partial().passthrough(),
  })
  .partial();
const AgentDiscoveryResult = z.object({
  agentId: z.string(),
  agentName: z.string(),
  success: z.boolean(),
  productCount: z.number().int().gte(0).lte(9007199254740991),
  error: z.string().optional(),
  skipReason: z.string().optional(),
  rawResponseData: z.unknown().optional(),
  debugLogs: z.array(AgentDebugLog).optional(),
});
const RefinementApplied = z.object({
  scope: z.enum(['request', 'product', 'proposal']).optional(),
  id: z.string().optional(),
  Status: z.enum(['applied', 'partial', 'unable']),
  notes: z.string().optional(),
});
const DiscoverProductsResponse = z.object({
  discoveryId: z.string(),
  productGroups: z.array(ProductGroup),
  totalGroups: z.number().int().gte(0).lte(9007199254740991),
  hasMoreGroups: z.boolean(),
  summary: DiscoverySummary,
  budgetContext: BudgetContextResponse.optional(),
  proposals: z.array(Proposal).optional(),
  agentResults: z.array(AgentDiscoveryResult).optional(),
  refinementApplied: z.array(RefinementApplied).optional(),
});
const StorefrontIds = z
  .union([z.array(z.number().int().lte(9007199254740991)), z.string()])
  .optional();
const StorefrontNames = z.union([z.array(z.string().max(255)), z.string()]).optional();
const Debug = z.union([z.boolean(), z.string()]).optional();
const SelectedProduct = z.object({
  productId: z.string(),
  salesAgentId: z.string(),
  cpm: z.number().optional(),
  budget: z.number().optional(),
  selectedAt: z.string(),
  groupId: z.string(),
  groupName: z.string(),
});
const SessionProductsResponse = z.object({
  discoveryId: z.string(),
  products: z.array(SelectedProduct),
  totalProducts: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  budgetContext: BudgetContextResponse.optional(),
});
const ProductSelection = z
  .object({
    productId: z.string(),
    salesAgentId: z.string(),
    groupId: z.string(),
    groupName: z.string(),
    bidPrice: z.number().optional(),
    budget: z.number().optional(),
    pricingOptionId: z.string().optional(),
  })
  .passthrough();
const AddProductsRequest = z
  .object({ products: z.array(ProductSelection).min(1), replace: z.boolean().optional() })
  .passthrough();
const RemoveProductsRequest = z.object({ productIds: z.array(z.string()).min(1) }).passthrough();
const ApplyProposalRequest = z
  .object({
    proposalId: z.string(),
    totalBudget: z.number().gt(0).optional(),
    replace: z.boolean().optional(),
  })
  .passthrough();
const AppliedProposalSummary = z.object({
  proposalId: z.string(),
  name: z.string(),
  salesAgentName: z.string().optional(),
});
const ApplyProposalResponse = z.object({
  discoveryId: z.string(),
  proposal: AppliedProposalSummary,
  totalBudgetUsed: z.number(),
  productsApplied: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  productsSkipped: z.array(z.string()),
  products: z.array(SelectedProduct),
  totalProducts: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  budgetContext: BudgetContextResponse.optional(),
});
const Status = z
  .union([
    z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
    z.array(z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'])),
  ])
  .optional();
const MediaBuyStatus = z
  .union([
    z.array(
      z.enum([
        'DRAFT',
        'PENDING_APPROVAL',
        'INPUT_REQUIRED',
        'ACTIVE',
        'PAUSED',
        'COMPLETED',
        'CANCELED',
        'FAILED',
        'REJECTED',
        'ARCHIVED',
      ])
    ),
    z.enum([
      'DRAFT',
      'PENDING_APPROVAL',
      'INPUT_REQUIRED',
      'ACTIVE',
      'PAUSED',
      'COMPLETED',
      'CANCELED',
      'FAILED',
      'REJECTED',
      'ARCHIVED',
    ]),
  ])
  .optional();
const CampaignType = z.enum(['DECISIONED', 'ROUTED']);
const CampaignSummary = z.object({
  campaignId: z.string(),
  advertiserId: z.string(),
  name: z.string(),
  Status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
  campaignType: CampaignType.optional(),
  flightDates: z
    .object({
      startDate: z.string().datetime({ offset: true }),
      endDate: z.string().datetime({ offset: true }),
    })
    .optional(),
  productCount: z.number().int().gte(0).lte(9007199254740991).optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  budget: z
    .object({ total: z.number().gt(0), currency: z.string().min(3).max(3).default('USD') })
    .optional(),
});
const CampaignListResponse = z.object({
  campaigns: z.array(CampaignSummary),
  total: z.number().int().gte(0).lte(9007199254740991),
});
const Duration = z
  .object({
    interval: z.number().int().lte(9007199254740991),
    unit: z.enum(['minutes', 'hours', 'days', 'campaign']),
  })
  .passthrough();
const OptimizationAttributionWindow = z
  .object({ postClick: Duration, postView: Duration.optional() })
  .passthrough();
const EventGoal = z
  .object({
    kind: z.literal('event'),
    eventSources: z
      .array(
        z
          .object({
            eventSourceId: z.string().min(1),
            EventType: z.enum([
              'page_view',
              'view_content',
              'select_content',
              'select_item',
              'search',
              'share',
              'add_to_cart',
              'remove_from_cart',
              'viewed_cart',
              'add_to_wishlist',
              'initiate_checkout',
              'add_payment_info',
              'purchase',
              'refund',
              'lead',
              'qualify_lead',
              'close_convert_lead',
              'disqualify_lead',
              'complete_registration',
              'subscribe',
              'start_trial',
              'app_install',
              'app_launch',
              'contact',
              'schedule',
              'donate',
              'submit_application',
              'custom',
            ]),
            customEventName: z.string().optional(),
            valueField: z.string().optional(),
            valueFactor: z.number().optional(),
          })
          .passthrough()
      )
      .min(1),
    target: z
      .union([
        z.object({ kind: z.literal('cost_per'), value: z.number().gt(0) }).passthrough(),
        z.object({ kind: z.literal('per_ad_spend'), value: z.number().gt(0) }).passthrough(),
        z.object({ kind: z.literal('maximize_value') }).passthrough(),
      ])
      .optional(),
    attributionWindow: OptimizationAttributionWindow.optional(),
    priority: z.number().int().gte(1).lte(9007199254740991).optional(),
  })
  .passthrough();
const MetricGoal = z
  .object({
    kind: z.literal('metric'),
    metric: z.enum([
      'clicks',
      'views',
      'completed_views',
      'viewed_seconds',
      'attention_seconds',
      'attention_score',
      'engagements',
      'follows',
      'saves',
      'profile_visits',
    ]),
    viewDurationSeconds: z.number().gt(0).optional(),
    target: z
      .union([
        z.object({ kind: z.literal('cost_per'), value: z.number().gt(0) }).passthrough(),
        z.object({ kind: z.literal('threshold_rate'), value: z.number().gt(0) }).passthrough(),
      ])
      .optional(),
    priority: z.number().int().gte(1).lte(9007199254740991).optional(),
  })
  .passthrough();
const OptimizationGoal = z.discriminatedUnion('kind', [EventGoal, MetricGoal]);
const PerformanceConfig = z
  .object({ optimizationGoals: z.array(OptimizationGoal).min(1) })
  .passthrough();
const PacingPeriods = z
  .object({
    mode: z.enum(['weight', 'budget']),
    periods: z
      .array(
        z
          .object({
            label: z.string().min(1).max(100),
            start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            weight: z.number().gte(0).lte(10).optional(),
            budget: z.number().gte(0).optional(),
          })
          .passthrough()
      )
      .min(1)
      .max(52),
  })
  .passthrough();
const CampaignUtmConfig = z
  .object({
    params: z
      .array(
        z
          .object({
            paramKey: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
            paramValue: z.string().min(1).max(200),
          })
          .passthrough()
      )
      .max(20),
    deleteMissing: z.boolean().optional(),
  })
  .passthrough();
const CampaignDataDeliveryInput = z
  .object({ outputs: DataDeliveryOutputArrayInput })
  .partial()
  .passthrough();
const CreateCampaignBody = z
  .object({
    advertiserId: z.number().int().lte(9007199254740991),
    name: z.string().min(1).max(255),
    flightDates: z
      .object({
        startDate: z.string().datetime({ offset: true }),
        endDate: z.string().datetime({ offset: true }),
      })
      .passthrough(),
    budget: z
      .object({
        total: z.number().gt(0),
        currency: z.string().min(3).max(3).optional(),
        dailyCap: z.number().gt(0).optional(),
        pacing: z.enum(['EVEN', 'ASAP', 'FRONTLOADED']).optional(),
      })
      .passthrough(),
    campaignType: CampaignType,
    brief: z.string().max(5000).optional(),
    constraints: z
      .object({
        geo_countries: z.array(z.string()),
        geo_countries_exclude: z.array(z.string()),
        geo_regions: z.array(z.string()),
        geo_regions_exclude: z.array(z.string()),
        geo_metros: z.array(
          z
            .object({
              system: z.union([
                z.literal('nielsen_dma'),
                z.literal('uk_itl1'),
                z.literal('uk_itl2'),
                z.literal('eurostat_nuts2'),
                z.literal('custom'),
              ]),
              values: z.array(z.string()),
            })
            .passthrough()
        ),
        geo_metros_exclude: z.array(
          z
            .object({
              system: z.union([
                z.literal('nielsen_dma'),
                z.literal('uk_itl1'),
                z.literal('uk_itl2'),
                z.literal('eurostat_nuts2'),
                z.literal('custom'),
              ]),
              values: z.array(z.string()),
            })
            .passthrough()
        ),
        geo_postal_areas: z.array(
          z
            .object({
              system: z.union([
                z.literal('us_zip'),
                z.literal('us_zip_plus_four'),
                z.literal('gb_outward'),
                z.literal('gb_full'),
                z.literal('ca_fsa'),
                z.literal('ca_full'),
                z.literal('de_plz'),
                z.literal('fr_code_postal'),
                z.literal('au_postcode'),
                z.literal('ch_plz'),
                z.literal('at_plz'),
              ]),
              values: z.array(z.string()),
            })
            .passthrough()
        ),
        geo_postal_areas_exclude: z.array(
          z
            .object({
              system: z.union([
                z.literal('us_zip'),
                z.literal('us_zip_plus_four'),
                z.literal('gb_outward'),
                z.literal('gb_full'),
                z.literal('ca_fsa'),
                z.literal('ca_full'),
                z.literal('de_plz'),
                z.literal('fr_code_postal'),
                z.literal('au_postcode'),
                z.literal('ch_plz'),
                z.literal('at_plz'),
              ]),
              values: z.array(z.string()),
            })
            .passthrough()
        ),
        language: z.array(z.string()),
        device_platform: z.array(
          z.union([
            z.literal('ios'),
            z.literal('android'),
            z.literal('windows'),
            z.literal('macos'),
            z.literal('linux'),
            z.literal('chromeos'),
            z.literal('tvos'),
            z.literal('tizen'),
            z.literal('webos'),
            z.literal('fire_os'),
            z.literal('roku_os'),
            z.literal('unknown'),
          ])
        ),
        device_type: z.array(
          z.union([
            z.literal('desktop'),
            z.literal('mobile'),
            z.literal('tablet'),
            z.literal('ctv'),
            z.literal('dooh'),
            z.literal('unknown'),
          ])
        ),
        device_type_exclude: z.array(
          z.union([
            z.literal('desktop'),
            z.literal('mobile'),
            z.literal('tablet'),
            z.literal('ctv'),
            z.literal('dooh'),
            z.literal('unknown'),
          ])
        ),
        channels: z.array(z.string()),
        countries: z.array(z.string().regex(/^[A-Z]{2}$/)).max(250),
      })
      .partial()
      .passthrough()
      .optional(),
    StorefrontIds: z.array(z.number().int().lte(9007199254740991)).max(50).optional(),
    discoveryId: z.string().min(1).optional(),
    productIds: z.array(z.string()).optional(),
    audienceConfig: z
      .object({
        targetAudienceIds: z.array(z.string().min(1)).max(100),
        suppressAudienceIds: z.array(z.string().min(1)).max(100),
      })
      .partial()
      .passthrough()
      .optional(),
    performanceConfig: PerformanceConfig.optional(),
    optimizationApplyMode: OptimizationApplyMode.optional(),
    catalogId: z.number().int().lte(9007199254740991).optional(),
    pacingPeriods: PacingPeriods.optional(),
    utmConfig: CampaignUtmConfig.optional(),
    dataDelivery: CampaignDataDeliveryInput.optional(),
    frequencyCaps: z
      .array(
        z
          .object({
            max_impressions: z.number().int().lte(9007199254740991),
            window: z
              .object({
                interval: z.number().gte(1),
                unit: z.union([
                  z.literal('seconds'),
                  z.literal('minutes'),
                  z.literal('hours'),
                  z.literal('days'),
                  z.literal('campaign'),
                ]),
              })
              .passthrough(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();
const MediaBuyRef = z.object({ MediaBuyId: z.string(), Status: z.string() });
const MediaBudget = z.object({ total: z.number().gt(0), currency: z.string().min(3).max(3) });
const CampaignFeePricingType = z.enum(['MARGIN', 'UNIT']);
const CampaignFeeUnit = z.enum(['CPM', 'RECORD', 'FLAT_RATE']);
const CampaignFee = z.object({
  label: z.string(),
  amount: z.number().gte(0),
  currency: z.string().min(3).max(3),
  pricingType: CampaignFeePricingType.optional(),
  marginPercent: z.number().gte(0).optional(),
  unit: CampaignFeeUnit.optional(),
  unitPrice: z.number().gte(0).optional(),
});
const CampaignFees = z.array(CampaignFee);
const PacingPeriodsOutput = z.object({
  mode: z.enum(['weight', 'budget']),
  periods: z
    .array(
      z.object({
        label: z.string().min(1).max(100),
        start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        weight: z.number().gte(0).lte(10).optional(),
        budget: z.number().gte(0).optional(),
      })
    )
    .min(1)
    .max(52),
});
const CampaignStorefrontRef = z.object({
  id: z.number().int().lte(9007199254740991),
  platformId: z.string(),
  name: z.string(),
});
const DurationOutput = z.object({
  interval: z.number().int().lte(9007199254740991),
  unit: z.enum(['minutes', 'hours', 'days', 'campaign']),
});
const OptimizationAttributionWindowOutput = z.object({
  postClick: DurationOutput,
  postView: DurationOutput.optional(),
});
const EventGoalOutput = z.object({
  kind: z.literal('event'),
  eventSources: z
    .array(
      z.object({
        eventSourceId: z.string().min(1),
        EventType: z.enum([
          'page_view',
          'view_content',
          'select_content',
          'select_item',
          'search',
          'share',
          'add_to_cart',
          'remove_from_cart',
          'viewed_cart',
          'add_to_wishlist',
          'initiate_checkout',
          'add_payment_info',
          'purchase',
          'refund',
          'lead',
          'qualify_lead',
          'close_convert_lead',
          'disqualify_lead',
          'complete_registration',
          'subscribe',
          'start_trial',
          'app_install',
          'app_launch',
          'contact',
          'schedule',
          'donate',
          'submit_application',
          'custom',
        ]),
        customEventName: z.string().optional(),
        valueField: z.string().optional(),
        valueFactor: z.number().optional(),
      })
    )
    .min(1),
  target: z
    .union([
      z.object({ kind: z.literal('cost_per'), value: z.number().gt(0) }),
      z.object({ kind: z.literal('per_ad_spend'), value: z.number().gt(0) }),
      z.object({ kind: z.literal('maximize_value') }),
    ])
    .optional(),
  attributionWindow: OptimizationAttributionWindowOutput.optional(),
  priority: z.number().int().gte(1).lte(9007199254740991).optional(),
});
const MetricGoalOutput = z.object({
  kind: z.literal('metric'),
  metric: z.enum([
    'clicks',
    'views',
    'completed_views',
    'viewed_seconds',
    'attention_seconds',
    'attention_score',
    'engagements',
    'follows',
    'saves',
    'profile_visits',
  ]),
  viewDurationSeconds: z.number().gt(0).optional(),
  target: z
    .union([
      z.object({ kind: z.literal('cost_per'), value: z.number().gt(0) }),
      z.object({ kind: z.literal('threshold_rate'), value: z.number().gt(0) }),
    ])
    .optional(),
  priority: z.number().int().gte(1).lte(9007199254740991).optional(),
});
const OptimizationGoalOutput = z.discriminatedUnion('kind', [EventGoalOutput, MetricGoalOutput]);
const PerformanceConfigOutput = z.object({
  optimizationGoals: z.array(OptimizationGoalOutput).min(1),
});
const CampaignDataDelivery = z.object({ outputs: z.array(DataDeliveryOutput) }).partial();
const Campaign = z.object({
  campaignId: z.string(),
  advertiserId: z.string(),
  name: z.string(),
  Status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
  mediaBuyRefs: z.array(MediaBuyRef).optional(),
  campaignType: CampaignType.optional(),
  brief: z.string().optional(),
  flightDates: z
    .object({
      startDate: z.string().datetime({ offset: true }),
      endDate: z.string().datetime({ offset: true }),
    })
    .optional(),
  budget: z
    .object({
      total: z.number().gt(0),
      currency: z.string().min(3).max(3).default('USD'),
      dailyCap: z.number().gt(0).optional(),
      pacing: z.enum(['EVEN', 'ASAP', 'FRONTLOADED']).optional(),
    })
    .optional(),
  mediaBudget: MediaBudget.optional(),
  fees: CampaignFees.optional(),
  allocatedBudget: z.number().gte(0).optional(),
  unallocatedBudget: z.number().optional(),
  pacingPeriods: PacingPeriodsOutput.optional(),
  constraints: z
    .object({
      geo_countries: z.array(z.string()),
      geo_countries_exclude: z.array(z.string()),
      geo_regions: z.array(z.string()),
      geo_regions_exclude: z.array(z.string()),
      geo_metros: z.array(
        z
          .object({
            system: z.union([
              z.literal('nielsen_dma'),
              z.literal('uk_itl1'),
              z.literal('uk_itl2'),
              z.literal('eurostat_nuts2'),
              z.literal('custom'),
            ]),
            values: z.array(z.string()),
          })
          .passthrough()
      ),
      geo_metros_exclude: z.array(
        z
          .object({
            system: z.union([
              z.literal('nielsen_dma'),
              z.literal('uk_itl1'),
              z.literal('uk_itl2'),
              z.literal('eurostat_nuts2'),
              z.literal('custom'),
            ]),
            values: z.array(z.string()),
          })
          .passthrough()
      ),
      geo_postal_areas: z.array(
        z
          .object({
            system: z.union([
              z.literal('us_zip'),
              z.literal('us_zip_plus_four'),
              z.literal('gb_outward'),
              z.literal('gb_full'),
              z.literal('ca_fsa'),
              z.literal('ca_full'),
              z.literal('de_plz'),
              z.literal('fr_code_postal'),
              z.literal('au_postcode'),
              z.literal('ch_plz'),
              z.literal('at_plz'),
            ]),
            values: z.array(z.string()),
          })
          .passthrough()
      ),
      geo_postal_areas_exclude: z.array(
        z
          .object({
            system: z.union([
              z.literal('us_zip'),
              z.literal('us_zip_plus_four'),
              z.literal('gb_outward'),
              z.literal('gb_full'),
              z.literal('ca_fsa'),
              z.literal('ca_full'),
              z.literal('de_plz'),
              z.literal('fr_code_postal'),
              z.literal('au_postcode'),
              z.literal('ch_plz'),
              z.literal('at_plz'),
            ]),
            values: z.array(z.string()),
          })
          .passthrough()
      ),
      language: z.array(z.string()),
      device_platform: z.array(
        z.union([
          z.literal('ios'),
          z.literal('android'),
          z.literal('windows'),
          z.literal('macos'),
          z.literal('linux'),
          z.literal('chromeos'),
          z.literal('tvos'),
          z.literal('tizen'),
          z.literal('webos'),
          z.literal('fire_os'),
          z.literal('roku_os'),
          z.literal('unknown'),
        ])
      ),
      device_type: z.array(
        z.union([
          z.literal('desktop'),
          z.literal('mobile'),
          z.literal('tablet'),
          z.literal('ctv'),
          z.literal('dooh'),
          z.literal('unknown'),
        ])
      ),
      device_type_exclude: z.array(
        z.union([
          z.literal('desktop'),
          z.literal('mobile'),
          z.literal('tablet'),
          z.literal('ctv'),
          z.literal('dooh'),
          z.literal('unknown'),
        ])
      ),
      channels: z.array(z.string()),
      countries: z.array(z.string().regex(/^[A-Z]{2}$/)).max(250),
    })
    .partial()
    .passthrough()
    .optional(),
  storefronts: z.array(CampaignStorefrontRef).optional(),
  performanceConfig: PerformanceConfigOutput.optional(),
  optimizationApplyMode: OptimizationApplyMode,
  catalogId: z.number().int().lte(9007199254740991).optional(),
  discoveryId: z.string().optional(),
  productCount: z.number().int().gte(0).lte(9007199254740991).optional(),
  products: z.array(z.object({ productId: z.string() })).optional(),
  audiences: z
    .array(
      z.object({
        audienceId: z.string(),
        name: z.string().nullable(),
        Status: z.enum(['PROCESSING', 'ERROR', 'READY', 'TOO_SMALL']),
        type: z.enum(['TARGET', 'SUPPRESS']),
        enabledAt: z.string().datetime({ offset: true }),
      })
    )
    .optional(),
  creativeFormats: z
    .object({
      required: z.array(z.object({ agent_url: z.string(), id: z.string() })),
      covered: z.array(z.object({ agent_url: z.string(), id: z.string() })),
      missing: z.array(z.object({ agent_url: z.string(), id: z.string() })),
    })
    .optional(),
  propertyLists: z
    .object({
      propertyLists: z.array(
        z.object({
          listId: z.string(),
          name: z.string(),
          purpose: z.enum(['include', 'exclude']),
          propertyCount: z.number().int().gte(0).lte(9007199254740991),
          createdAt: z.string(),
          updatedAt: z.string(),
          viaMediaBuys: z.array(
            z.object({ MediaBuyId: z.string(), packageIds: z.array(z.string()) })
          ),
        })
      ),
      summary: z.object({
        totalLists: z.number().int().gte(0).lte(9007199254740991),
        includeCount: z.number().int().gte(0).lte(9007199254740991),
        excludeCount: z.number().int().gte(0).lte(9007199254740991),
      }),
    })
    .optional(),
  mediaBuys: z
    .array(
      z.object({
        MediaBuyId: z.string(),
        name: z.string(),
        Status: z.string(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        products: z
          .array(
            z.object({
              productId: z.string(),
              productName: z.string().optional(),
              publisherName: z.string().optional(),
              salesAgentName: z.string().optional(),
              budget: z.number().optional(),
              budgetCurrency: z.string().optional(),
            })
          )
          .optional(),
        pacingPeriods: PacingPeriodsOutput.optional(),
        packages: z
          .array(
            z.object({
              packageId: z.string(),
              Status: z.string(),
              budget: z.number().optional(),
              budgetCurrency: z.string().optional(),
              pacing: z.string().optional(),
              bidPrice: z.number().optional(),
              productIds: z.array(z.string()),
              delivery: z
                .object({
                  impressions: z.number(),
                  spend: z.number(),
                  clicks: z.number().nullable(),
                })
                .optional(),
            })
          )
          .optional(),
        optimizationGoals: z
          .array(
            z.union([
              z
                .object({
                  kind: z.literal('metric'),
                  metric: z.union([
                    z.literal('clicks'),
                    z.literal('views'),
                    z.literal('completed_views'),
                    z.literal('viewed_seconds'),
                    z.literal('attention_seconds'),
                    z.literal('attention_score'),
                    z.literal('engagements'),
                    z.literal('follows'),
                    z.literal('saves'),
                    z.literal('profile_visits'),
                    z.literal('reach'),
                  ]),
                  reach_unit: z
                    .union([
                      z.literal('individuals'),
                      z.literal('households'),
                      z.literal('devices'),
                      z.literal('accounts'),
                      z.literal('cookies'),
                      z.literal('custom'),
                    ])
                    .optional(),
                  target_frequency: z
                    .object({
                      min: z.number().gte(1).optional(),
                      max: z.number().gte(1).optional(),
                      window: z
                        .object({
                          interval: z.number().gte(1),
                          unit: z.union([
                            z.literal('seconds'),
                            z.literal('minutes'),
                            z.literal('hours'),
                            z.literal('days'),
                            z.literal('campaign'),
                          ]),
                        })
                        .passthrough(),
                    })
                    .passthrough()
                    .optional(),
                  view_duration_seconds: z.number().optional(),
                  target: z
                    .union([
                      z.object({ kind: z.literal('cost_per'), value: z.number() }).passthrough(),
                      z
                        .object({ kind: z.literal('threshold_rate'), value: z.number() })
                        .passthrough(),
                    ])
                    .optional(),
                  priority: z.number().gte(1).optional(),
                })
                .passthrough(),
              z
                .object({
                  kind: z.literal('event'),
                  event_sources: z.array(
                    z
                      .object({
                        event_source_id: z.string().min(1),
                        event_type: z.union([
                          z.literal('page_view'),
                          z.literal('view_content'),
                          z.literal('select_content'),
                          z.literal('select_item'),
                          z.literal('search'),
                          z.literal('share'),
                          z.literal('add_to_cart'),
                          z.literal('remove_from_cart'),
                          z.literal('viewed_cart'),
                          z.literal('add_to_wishlist'),
                          z.literal('initiate_checkout'),
                          z.literal('add_payment_info'),
                          z.literal('purchase'),
                          z.literal('refund'),
                          z.literal('lead'),
                          z.literal('qualify_lead'),
                          z.literal('close_convert_lead'),
                          z.literal('disqualify_lead'),
                          z.literal('complete_registration'),
                          z.literal('subscribe'),
                          z.literal('start_trial'),
                          z.literal('app_install'),
                          z.literal('app_launch'),
                          z.literal('contact'),
                          z.literal('schedule'),
                          z.literal('donate'),
                          z.literal('submit_application'),
                          z.literal('custom'),
                        ]),
                        custom_event_name: z.string().optional(),
                        value_field: z.string().optional(),
                        value_factor: z.number().optional(),
                      })
                      .passthrough()
                  ),
                  target: z
                    .union([
                      z.object({ kind: z.literal('cost_per'), value: z.number() }).passthrough(),
                      z
                        .object({ kind: z.literal('per_ad_spend'), value: z.number() })
                        .passthrough(),
                      z.object({ kind: z.literal('maximize_value') }).passthrough(),
                    ])
                    .optional(),
                  attribution_window: z
                    .object({
                      post_click: z
                        .object({
                          interval: z.number().gte(1),
                          unit: z.union([
                            z.literal('seconds'),
                            z.literal('minutes'),
                            z.literal('hours'),
                            z.literal('days'),
                            z.literal('campaign'),
                          ]),
                        })
                        .passthrough(),
                      post_view: z
                        .object({
                          interval: z.number().gte(1),
                          unit: z.union([
                            z.literal('seconds'),
                            z.literal('minutes'),
                            z.literal('hours'),
                            z.literal('days'),
                            z.literal('campaign'),
                          ]),
                        })
                        .passthrough(),
                      model: z.union([
                        z.literal('last_touch'),
                        z.literal('first_touch'),
                        z.literal('linear'),
                        z.literal('time_decay'),
                        z.literal('data_driven'),
                      ]),
                    })
                    .partial()
                    .passthrough()
                    .optional(),
                  priority: z.number().gte(1).optional(),
                })
                .passthrough(),
              z
                .object({
                  kind: z.literal('vendor_metric'),
                  vendor: z
                    .object({
                      domain: z
                        .string()
                        .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/),
                      brand_id: z.string().optional(),
                      industries: z.array(z.string()).optional(),
                      data_subject_contestation: z
                        .object({
                          url: z.string().regex(/^https:\/\//),
                          email: z
                            .string()
                            .regex(
                              /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/
                            )
                            .email(),
                          languages: z.array(z.string()),
                        })
                        .partial()
                        .passthrough()
                        .optional(),
                      brand_kit_override: z
                        .object({
                          logo: z
                            .object({
                              asset_type: z.literal('image'),
                              url: z.string(),
                              width: z.number().gte(1),
                              height: z.number().gte(1),
                              format: z.string().optional(),
                              alt_text: z.string().optional(),
                              provenance: z
                                .object({
                                  digital_source_type: z.union([
                                    z.literal('digital_capture'),
                                    z.literal('digital_creation'),
                                    z.literal('trained_algorithmic_media'),
                                    z.literal('composite_with_trained_algorithmic_media'),
                                    z.literal('algorithmic_media'),
                                    z.literal('composite_capture'),
                                    z.literal('composite_synthetic'),
                                    z.literal('human_edits'),
                                    z.literal('data_driven_media'),
                                  ]),
                                  ai_tool: z
                                    .object({
                                      name: z.string(),
                                      version: z.string().optional(),
                                      provider: z.string().optional(),
                                    })
                                    .passthrough(),
                                  human_oversight: z.union([
                                    z.literal('none'),
                                    z.literal('prompt_only'),
                                    z.literal('selected'),
                                    z.literal('edited'),
                                    z.literal('directed'),
                                  ]),
                                  declared_by: z
                                    .object({
                                      agent_url: z.string().optional(),
                                      role: z.union([
                                        z.literal('creator'),
                                        z.literal('advertiser'),
                                        z.literal('agency'),
                                        z.literal('platform'),
                                        z.literal('tool'),
                                      ]),
                                    })
                                    .passthrough(),
                                  declared_at: z.string().datetime({ offset: true }),
                                  created_time: z.string().datetime({ offset: true }),
                                  c2pa: z.object({ manifest_url: z.string() }).passthrough(),
                                  embedded_provenance: z.array(
                                    z
                                      .object({
                                        method: z.union([
                                          z.literal('manifest_wrapper'),
                                          z.literal('provenance_markers'),
                                        ]),
                                        standard: z.string().optional(),
                                        provider: z.string(),
                                        verify_agent: z
                                          .object({
                                            agent_url: z.string().regex(/^https:\/\//),
                                            feature_id: z.string().optional(),
                                          })
                                          .passthrough()
                                          .optional(),
                                        embedded_at: z
                                          .string()
                                          .datetime({ offset: true })
                                          .optional(),
                                      })
                                      .passthrough()
                                  ),
                                  watermarks: z.array(
                                    z
                                      .object({
                                        media_type: z.union([
                                          z.literal('audio'),
                                          z.literal('image'),
                                          z.literal('video'),
                                          z.literal('text'),
                                        ]),
                                        provider: z.string(),
                                        verify_agent: z
                                          .object({
                                            agent_url: z.string().regex(/^https:\/\//),
                                            feature_id: z.string().optional(),
                                          })
                                          .passthrough()
                                          .optional(),
                                        c2pa_action: z
                                          .union([
                                            z.literal('c2pa.watermarked.bound'),
                                            z.literal('c2pa.watermarked.unbound'),
                                          ])
                                          .optional(),
                                        embedded_at: z
                                          .string()
                                          .datetime({ offset: true })
                                          .optional(),
                                      })
                                      .passthrough()
                                  ),
                                  disclosure: z
                                    .object({
                                      required: z.boolean(),
                                      jurisdictions: z
                                        .array(
                                          z
                                            .object({
                                              country: z.string(),
                                              region: z.string().optional(),
                                              regulation: z.string(),
                                              label_text: z.string().optional(),
                                              render_guidance: z
                                                .object({
                                                  persistence: z.union([
                                                    z.literal('continuous'),
                                                    z.literal('initial'),
                                                    z.literal('flexible'),
                                                  ]),
                                                  min_duration_ms: z.number().gte(1),
                                                  positions: z.array(
                                                    z.union([
                                                      z.literal('prominent'),
                                                      z.literal('footer'),
                                                      z.literal('audio'),
                                                      z.literal('subtitle'),
                                                      z.literal('overlay'),
                                                      z.literal('end_card'),
                                                      z.literal('pre_roll'),
                                                      z.literal('companion'),
                                                    ])
                                                  ),
                                                  ext: z.object({}).partial().passthrough(),
                                                })
                                                .partial()
                                                .passthrough()
                                                .optional(),
                                            })
                                            .passthrough()
                                        )
                                        .optional(),
                                    })
                                    .passthrough(),
                                  verification: z.array(
                                    z
                                      .object({
                                        verified_by: z.string(),
                                        verified_time: z
                                          .string()
                                          .datetime({ offset: true })
                                          .optional(),
                                        result: z.union([
                                          z.literal('authentic'),
                                          z.literal('ai_generated'),
                                          z.literal('ai_modified'),
                                          z.literal('inconclusive'),
                                        ]),
                                        confidence: z.number().gte(0).lte(1).optional(),
                                        details_url: z.string().optional(),
                                      })
                                      .passthrough()
                                  ),
                                  ext: z.object({}).partial().passthrough(),
                                })
                                .partial()
                                .passthrough()
                                .optional(),
                            })
                            .passthrough(),
                          colors: z
                            .object({
                              primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
                              secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
                              accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
                            })
                            .partial()
                            .passthrough(),
                          voice: z.string(),
                          tagline: z.string(),
                        })
                        .partial()
                        .passthrough()
                        .optional(),
                    })
                    .passthrough(),
                  metric_id: z.string(),
                  target: z
                    .union([
                      z.object({ kind: z.literal('cost_per'), value: z.number() }).passthrough(),
                      z
                        .object({ kind: z.literal('threshold_rate'), value: z.number() })
                        .passthrough(),
                    ])
                    .optional(),
                  priority: z.number().gte(1).optional(),
                })
                .passthrough(),
            ])
          )
          .optional(),
        performance: z
          .object({
            impressions: z.number(),
            spend: z.number(),
            clicks: z.number(),
            views: z.number(),
            completedViews: z.number(),
            conversions: z.number(),
            leads: z.number(),
            lastUpdated: z.string().datetime({ offset: true }).optional(),
          })
          .optional(),
        createdAt: z.string().datetime({ offset: true }),
        updatedAt: z.string().datetime({ offset: true }),
      })
    )
    .optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  dataDelivery: CampaignDataDelivery.optional(),
  frequencyCaps: z
    .array(
      z
        .object({
          max_impressions: z.number().int().lte(9007199254740991),
          window: z
            .object({
              interval: z.number().gte(1),
              unit: z.union([
                z.literal('seconds'),
                z.literal('minutes'),
                z.literal('hours'),
                z.literal('days'),
                z.literal('campaign'),
              ]),
            })
            .passthrough(),
          id: z.string(),
          targetLevel: FrequencyCapTargetLevel,
          targetId: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
          archivedAt: z.string().nullish(),
        })
        .passthrough()
    )
    .optional(),
});
const CampaignResponse = z.object({ campaign: Campaign });
const UpdateCampaignBody = z
  .object({
    name: z.string().min(1).max(255),
    flightDates: z
      .object({
        startDate: z.string().datetime({ offset: true }),
        endDate: z.string().datetime({ offset: true }),
      })
      .passthrough(),
    budget: z
      .object({
        total: z.number().gt(0),
        currency: z.string().min(3).max(3).default('USD'),
        dailyCap: z.number().gt(0),
        pacing: z.enum(['EVEN', 'ASAP', 'FRONTLOADED']),
      })
      .partial()
      .passthrough(),
    brief: z.string().max(5000),
    constraints: z
      .object({
        geo_countries: z.array(z.string()),
        geo_countries_exclude: z.array(z.string()),
        geo_regions: z.array(z.string()),
        geo_regions_exclude: z.array(z.string()),
        geo_metros: z.array(
          z
            .object({
              system: z.union([
                z.literal('nielsen_dma'),
                z.literal('uk_itl1'),
                z.literal('uk_itl2'),
                z.literal('eurostat_nuts2'),
                z.literal('custom'),
              ]),
              values: z.array(z.string()),
            })
            .passthrough()
        ),
        geo_metros_exclude: z.array(
          z
            .object({
              system: z.union([
                z.literal('nielsen_dma'),
                z.literal('uk_itl1'),
                z.literal('uk_itl2'),
                z.literal('eurostat_nuts2'),
                z.literal('custom'),
              ]),
              values: z.array(z.string()),
            })
            .passthrough()
        ),
        geo_postal_areas: z.array(
          z
            .object({
              system: z.union([
                z.literal('us_zip'),
                z.literal('us_zip_plus_four'),
                z.literal('gb_outward'),
                z.literal('gb_full'),
                z.literal('ca_fsa'),
                z.literal('ca_full'),
                z.literal('de_plz'),
                z.literal('fr_code_postal'),
                z.literal('au_postcode'),
                z.literal('ch_plz'),
                z.literal('at_plz'),
              ]),
              values: z.array(z.string()),
            })
            .passthrough()
        ),
        geo_postal_areas_exclude: z.array(
          z
            .object({
              system: z.union([
                z.literal('us_zip'),
                z.literal('us_zip_plus_four'),
                z.literal('gb_outward'),
                z.literal('gb_full'),
                z.literal('ca_fsa'),
                z.literal('ca_full'),
                z.literal('de_plz'),
                z.literal('fr_code_postal'),
                z.literal('au_postcode'),
                z.literal('ch_plz'),
                z.literal('at_plz'),
              ]),
              values: z.array(z.string()),
            })
            .passthrough()
        ),
        language: z.array(z.string()),
        device_platform: z.array(
          z.union([
            z.literal('ios'),
            z.literal('android'),
            z.literal('windows'),
            z.literal('macos'),
            z.literal('linux'),
            z.literal('chromeos'),
            z.literal('tvos'),
            z.literal('tizen'),
            z.literal('webos'),
            z.literal('fire_os'),
            z.literal('roku_os'),
            z.literal('unknown'),
          ])
        ),
        device_type: z.array(
          z.union([
            z.literal('desktop'),
            z.literal('mobile'),
            z.literal('tablet'),
            z.literal('ctv'),
            z.literal('dooh'),
            z.literal('unknown'),
          ])
        ),
        device_type_exclude: z.array(
          z.union([
            z.literal('desktop'),
            z.literal('mobile'),
            z.literal('tablet'),
            z.literal('ctv'),
            z.literal('dooh'),
            z.literal('unknown'),
          ])
        ),
        channels: z.array(z.string()),
        countries: z.array(z.string().regex(/^[A-Z]{2}$/)).max(250),
      })
      .partial()
      .passthrough(),
    StorefrontIds: z.array(z.number().int().lte(9007199254740991)).max(50),
    discoveryId: z.string().min(1),
    audienceConfig: z
      .object({
        targetAudienceIds: z.array(z.string().min(1)).max(100),
        suppressAudienceIds: z.array(z.string().min(1)).max(100),
        deleteMissing: z.boolean(),
      })
      .partial()
      .passthrough(),
    performanceConfig: PerformanceConfig,
    optimizationApplyMode: OptimizationApplyMode,
    catalogId: z.number().int().lte(9007199254740991).nullable(),
    mediaBuys: z.array(
      z.object({
        action: z.enum(['update', 'cancel', 'delete']).optional(),
        MediaBuyId: z.string().min(1),
        reason: z.string().max(1000).optional(),
        packageIds: z.array(z.string().min(1)).optional(),
        name: z.string().min(1).max(255).optional(),
        packages: z
          .array(
            z.object({
              packageId: z.string().min(1),
              budget: z.number().gt(0).optional(),
              pacing: z.enum(['even', 'asap']).optional(),
              bid_price: z.number().nullish(),
            })
          )
          .optional(),
        pacingPeriods: PacingPeriods.nullish(),
        products: z
          .array(
            z.object({
              product_id: z.string().min(1),
              pricing_option_id: z.string().optional(),
              budget: z.number().gt(0).optional(),
              pacing: z.enum(['asap', 'even', 'front_loaded']).optional(),
              bid_price: z.number().nullish(),
              remove: z.boolean().optional(),
            })
          )
          .optional(),
        start_time: z.string().optional(),
        end_time: z.string().optional(),
        updated_reason: z.string().optional(),
        suggestion_id: z.string().optional(),
        optimization_goals: z
          .array(
            z.union([
              z
                .object({
                  kind: z.literal('metric'),
                  metric: z.union([
                    z.literal('clicks'),
                    z.literal('views'),
                    z.literal('completed_views'),
                    z.literal('viewed_seconds'),
                    z.literal('attention_seconds'),
                    z.literal('attention_score'),
                    z.literal('engagements'),
                    z.literal('follows'),
                    z.literal('saves'),
                    z.literal('profile_visits'),
                    z.literal('reach'),
                  ]),
                  reach_unit: z
                    .union([
                      z.literal('individuals'),
                      z.literal('households'),
                      z.literal('devices'),
                      z.literal('accounts'),
                      z.literal('cookies'),
                      z.literal('custom'),
                    ])
                    .optional(),
                  target_frequency: z
                    .object({
                      min: z.number().gte(1).optional(),
                      max: z.number().gte(1).optional(),
                      window: z
                        .object({
                          interval: z.number().gte(1),
                          unit: z.union([
                            z.literal('seconds'),
                            z.literal('minutes'),
                            z.literal('hours'),
                            z.literal('days'),
                            z.literal('campaign'),
                          ]),
                        })
                        .passthrough(),
                    })
                    .passthrough()
                    .optional(),
                  view_duration_seconds: z.number().optional(),
                  target: z
                    .union([
                      z.object({ kind: z.literal('cost_per'), value: z.number() }).passthrough(),
                      z
                        .object({ kind: z.literal('threshold_rate'), value: z.number() })
                        .passthrough(),
                    ])
                    .optional(),
                  priority: z.number().gte(1).optional(),
                })
                .passthrough(),
              z
                .object({
                  kind: z.literal('event'),
                  event_sources: z.array(
                    z
                      .object({
                        event_source_id: z.string().min(1),
                        event_type: z.union([
                          z.literal('page_view'),
                          z.literal('view_content'),
                          z.literal('select_content'),
                          z.literal('select_item'),
                          z.literal('search'),
                          z.literal('share'),
                          z.literal('add_to_cart'),
                          z.literal('remove_from_cart'),
                          z.literal('viewed_cart'),
                          z.literal('add_to_wishlist'),
                          z.literal('initiate_checkout'),
                          z.literal('add_payment_info'),
                          z.literal('purchase'),
                          z.literal('refund'),
                          z.literal('lead'),
                          z.literal('qualify_lead'),
                          z.literal('close_convert_lead'),
                          z.literal('disqualify_lead'),
                          z.literal('complete_registration'),
                          z.literal('subscribe'),
                          z.literal('start_trial'),
                          z.literal('app_install'),
                          z.literal('app_launch'),
                          z.literal('contact'),
                          z.literal('schedule'),
                          z.literal('donate'),
                          z.literal('submit_application'),
                          z.literal('custom'),
                        ]),
                        custom_event_name: z.string().optional(),
                        value_field: z.string().optional(),
                        value_factor: z.number().optional(),
                      })
                      .passthrough()
                  ),
                  target: z
                    .union([
                      z.object({ kind: z.literal('cost_per'), value: z.number() }).passthrough(),
                      z
                        .object({ kind: z.literal('per_ad_spend'), value: z.number() })
                        .passthrough(),
                      z.object({ kind: z.literal('maximize_value') }).passthrough(),
                    ])
                    .optional(),
                  attribution_window: z
                    .object({
                      post_click: z
                        .object({
                          interval: z.number().gte(1),
                          unit: z.union([
                            z.literal('seconds'),
                            z.literal('minutes'),
                            z.literal('hours'),
                            z.literal('days'),
                            z.literal('campaign'),
                          ]),
                        })
                        .passthrough(),
                      post_view: z
                        .object({
                          interval: z.number().gte(1),
                          unit: z.union([
                            z.literal('seconds'),
                            z.literal('minutes'),
                            z.literal('hours'),
                            z.literal('days'),
                            z.literal('campaign'),
                          ]),
                        })
                        .passthrough(),
                      model: z.union([
                        z.literal('last_touch'),
                        z.literal('first_touch'),
                        z.literal('linear'),
                        z.literal('time_decay'),
                        z.literal('data_driven'),
                      ]),
                    })
                    .partial()
                    .passthrough()
                    .optional(),
                  priority: z.number().gte(1).optional(),
                })
                .passthrough(),
              z
                .object({
                  kind: z.literal('vendor_metric'),
                  vendor: z
                    .object({
                      domain: z
                        .string()
                        .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/),
                      brand_id: z.string().optional(),
                      industries: z.array(z.string()).optional(),
                      data_subject_contestation: z
                        .object({
                          url: z.string().regex(/^https:\/\//),
                          email: z
                            .string()
                            .regex(
                              /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/
                            )
                            .email(),
                          languages: z.array(z.string()),
                        })
                        .partial()
                        .passthrough()
                        .optional(),
                      brand_kit_override: z
                        .object({
                          logo: z
                            .object({
                              asset_type: z.literal('image'),
                              url: z.string(),
                              width: z.number().gte(1),
                              height: z.number().gte(1),
                              format: z.string().optional(),
                              alt_text: z.string().optional(),
                              provenance: z
                                .object({
                                  digital_source_type: z.union([
                                    z.literal('digital_capture'),
                                    z.literal('digital_creation'),
                                    z.literal('trained_algorithmic_media'),
                                    z.literal('composite_with_trained_algorithmic_media'),
                                    z.literal('algorithmic_media'),
                                    z.literal('composite_capture'),
                                    z.literal('composite_synthetic'),
                                    z.literal('human_edits'),
                                    z.literal('data_driven_media'),
                                  ]),
                                  ai_tool: z
                                    .object({
                                      name: z.string(),
                                      version: z.string().optional(),
                                      provider: z.string().optional(),
                                    })
                                    .passthrough(),
                                  human_oversight: z.union([
                                    z.literal('none'),
                                    z.literal('prompt_only'),
                                    z.literal('selected'),
                                    z.literal('edited'),
                                    z.literal('directed'),
                                  ]),
                                  declared_by: z
                                    .object({
                                      agent_url: z.string().optional(),
                                      role: z.union([
                                        z.literal('creator'),
                                        z.literal('advertiser'),
                                        z.literal('agency'),
                                        z.literal('platform'),
                                        z.literal('tool'),
                                      ]),
                                    })
                                    .passthrough(),
                                  declared_at: z.string().datetime({ offset: true }),
                                  created_time: z.string().datetime({ offset: true }),
                                  c2pa: z.object({ manifest_url: z.string() }).passthrough(),
                                  embedded_provenance: z.array(
                                    z
                                      .object({
                                        method: z.union([
                                          z.literal('manifest_wrapper'),
                                          z.literal('provenance_markers'),
                                        ]),
                                        standard: z.string().optional(),
                                        provider: z.string(),
                                        verify_agent: z
                                          .object({
                                            agent_url: z.string().regex(/^https:\/\//),
                                            feature_id: z.string().optional(),
                                          })
                                          .passthrough()
                                          .optional(),
                                        embedded_at: z
                                          .string()
                                          .datetime({ offset: true })
                                          .optional(),
                                      })
                                      .passthrough()
                                  ),
                                  watermarks: z.array(
                                    z
                                      .object({
                                        media_type: z.union([
                                          z.literal('audio'),
                                          z.literal('image'),
                                          z.literal('video'),
                                          z.literal('text'),
                                        ]),
                                        provider: z.string(),
                                        verify_agent: z
                                          .object({
                                            agent_url: z.string().regex(/^https:\/\//),
                                            feature_id: z.string().optional(),
                                          })
                                          .passthrough()
                                          .optional(),
                                        c2pa_action: z
                                          .union([
                                            z.literal('c2pa.watermarked.bound'),
                                            z.literal('c2pa.watermarked.unbound'),
                                          ])
                                          .optional(),
                                        embedded_at: z
                                          .string()
                                          .datetime({ offset: true })
                                          .optional(),
                                      })
                                      .passthrough()
                                  ),
                                  disclosure: z
                                    .object({
                                      required: z.boolean(),
                                      jurisdictions: z
                                        .array(
                                          z
                                            .object({
                                              country: z.string(),
                                              region: z.string().optional(),
                                              regulation: z.string(),
                                              label_text: z.string().optional(),
                                              render_guidance: z
                                                .object({
                                                  persistence: z.union([
                                                    z.literal('continuous'),
                                                    z.literal('initial'),
                                                    z.literal('flexible'),
                                                  ]),
                                                  min_duration_ms: z.number().gte(1),
                                                  positions: z.array(
                                                    z.union([
                                                      z.literal('prominent'),
                                                      z.literal('footer'),
                                                      z.literal('audio'),
                                                      z.literal('subtitle'),
                                                      z.literal('overlay'),
                                                      z.literal('end_card'),
                                                      z.literal('pre_roll'),
                                                      z.literal('companion'),
                                                    ])
                                                  ),
                                                  ext: z.object({}).partial().passthrough(),
                                                })
                                                .partial()
                                                .passthrough()
                                                .optional(),
                                            })
                                            .passthrough()
                                        )
                                        .optional(),
                                    })
                                    .passthrough(),
                                  verification: z.array(
                                    z
                                      .object({
                                        verified_by: z.string(),
                                        verified_time: z
                                          .string()
                                          .datetime({ offset: true })
                                          .optional(),
                                        result: z.union([
                                          z.literal('authentic'),
                                          z.literal('ai_generated'),
                                          z.literal('ai_modified'),
                                          z.literal('inconclusive'),
                                        ]),
                                        confidence: z.number().gte(0).lte(1).optional(),
                                        details_url: z.string().optional(),
                                      })
                                      .passthrough()
                                  ),
                                  ext: z.object({}).partial().passthrough(),
                                })
                                .partial()
                                .passthrough()
                                .optional(),
                            })
                            .passthrough(),
                          colors: z
                            .object({
                              primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
                              secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
                              accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
                            })
                            .partial()
                            .passthrough(),
                          voice: z.string(),
                          tagline: z.string(),
                        })
                        .partial()
                        .passthrough()
                        .optional(),
                    })
                    .passthrough(),
                  metric_id: z.string(),
                  target: z
                    .union([
                      z.object({ kind: z.literal('cost_per'), value: z.number() }).passthrough(),
                      z
                        .object({ kind: z.literal('threshold_rate'), value: z.number() })
                        .passthrough(),
                    ])
                    .optional(),
                  priority: z.number().gte(1).optional(),
                })
                .passthrough(),
            ])
          )
          .optional(),
        creative_ids: z.array(z.string().min(1)).optional(),
      })
    ),
    pacingPeriods: PacingPeriods.nullable(),
    utmConfig: CampaignUtmConfig,
    dataDelivery: z.object({ outputs: DataDeliveryOutputArrayInput }).partial().passthrough(),
    frequencyCaps: z.array(
      z
        .object({
          max_impressions: z.number().int().lte(9007199254740991),
          window: z
            .object({
              interval: z.number().gte(1),
              unit: z.union([
                z.literal('seconds'),
                z.literal('minutes'),
                z.literal('hours'),
                z.literal('days'),
                z.literal('campaign'),
              ]),
            })
            .passthrough(),
        })
        .passthrough()
    ),
  })
  .partial()
  .passthrough();
const MediaBuyId = z.union([z.array(z.string()), z.string()]).optional();
const IncludePropertyLists = z.union([z.boolean(), z.enum(['true', 'false'])]).optional();
const ExecuteCampaignBody = z.object({ Debug: z.boolean() }).partial().passthrough();
const ExecuteMediaBuyDebugInfo = z
  .object({
    request: z.object({}).partial().passthrough(),
    response: z.object({}).partial().passthrough(),
    debugLogs: z.array(z.object({}).partial().passthrough()),
    error: z.string(),
  })
  .partial();
const ExecutionError = z.object({
  MediaBuyId: z.string(),
  salesAgentId: z.string(),
  message: z.string(),
  Debug: ExecuteMediaBuyDebugInfo.optional(),
});
const CampaignStatusChangeResponse = z.object({
  campaignId: z.string(),
  previousStatus: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
  newStatus: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
  success: z.boolean(),
  errors: z.array(ExecutionError).optional(),
});
const RefinementItem = z.union([
  z.object({ scope: z.literal('request'), ask: z.string().min(1) }).passthrough(),
  z
    .object({
      scope: z.literal('product'),
      id: z.string().min(1),
      action: z.enum(['include', 'omit', 'moreLikeThis']),
      ask: z.string().min(1).optional(),
    })
    .passthrough(),
]);
const AutoSelectProductsRequest = z
  .object({
    refine: z.array(RefinementItem).min(1),
    maxProducts: z.number().int().lte(9007199254740991),
    minBudgetPerProduct: z.number().gt(0),
  })
  .partial()
  .passthrough();
const AutoSelectProductsResponse = z.object({
  campaignId: z.string(),
  discoveryId: z.string(),
  selectedProducts: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      salesAgentId: z.string(),
      groupId: z.string(),
      groupName: z.string(),
      cpm: z.number().optional(),
      budget: z.number(),
      pricingOptionId: z.string().optional(),
    })
  ),
  budgetContext: z.object({
    campaignBudget: z.number(),
    totalAllocated: z.number(),
    remainingBudget: z.number(),
    currency: z.string(),
  }),
  productCount: z.number().int().gte(0).lte(9007199254740991),
  previouslySelectedCount: z.number().int().gte(0).lte(9007199254740991).optional(),
});
const GetAdcpStatusOutput = z.object({
  campaign_id: z.string(),
  media_buys: z.array(
    z.object({
      media_buy_id: z.string(),
      adcp_media_buy_id: z.string(),
      internal_status: z.string(),
      adcp_status: z.string().nullable(),
      previous_internal_status: z.string(),
      previous_adcp_status: z.string().nullable(),
      updated: z.boolean(),
    })
  ),
  agents_queried: z.number().int().gte(0).lte(9007199254740991),
  errors: z.array(z.object({ media_buy_id: z.string(), error: z.string() })),
});
const CampaignProductEntry = z.object({
  productId: z.string(),
  productName: z.string().optional(),
  salesAgentId: z.string(),
  salesAgentName: z.string().optional(),
  publisherDomain: z.string().optional(),
  publisherName: z.string().optional(),
  bidPrice: z.number().optional(),
  budget: z.number().optional(),
  pricingOptionId: z.string().optional(),
  pricingModel: z.string().optional(),
  selectedAt: z.string(),
  searchContext: z.object({ id: z.string(), brief: z.string() }).optional(),
  mediaBuys: z.array(z.object({ MediaBuyId: z.string(), Status: z.string(), name: z.string() })),
});
const CampaignSearchContextSummary = z.object({
  id: z.string(),
  brief: z.string(),
  channels: z.array(z.string()),
  countries: z.array(z.string()),
  createdAt: z.string(),
  productCount: z.number().int().gte(0).lte(9007199254740991),
});
const CampaignProductsResponse = z.object({
  campaignId: z.string(),
  discoveryId: z.string().nullable(),
  products: z.array(CampaignProductEntry),
  searchContexts: z.array(CampaignSearchContextSummary),
  summary: z.object({
    totalProducts: z.number().int().gte(0).lte(9007199254740991),
    productsOnMediaBuys: z.number().int().gte(0).lte(9007199254740991),
    productsPending: z.number().int().gte(0).lte(9007199254740991),
  }),
});
const ResourceTypes = z
  .union([z.array(z.enum(['CAMPAIGN', 'CREATIVE', 'MEDIA_BUY', 'PRODUCT', 'PACKAGE'])), z.string()])
  .optional();
const BuyerAuditLog = z.object({
  id: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  timestamp: z.string(),
  createdAt: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string().nullable(),
  resourceName: z.string().nullable(),
  parentType: z.string().nullable(),
  advertiserId: z.number().int().gte(-9007199254740991).lte(9007199254740991).nullable(),
  userId: z.number().int().gte(-9007199254740991).lte(9007199254740991).nullable(),
  userEmail: z.string().nullable(),
  userName: z.string().nullable(),
  serviceTokenId: z.number().int().gte(-9007199254740991).lte(9007199254740991).nullable(),
  serviceTokenName: z.string().nullable(),
  parameters: z.object({}).partial().passthrough().nullable(),
  changes: z.object({}).partial().passthrough().nullable(),
  description: z.string(),
});
const ListBuyerActivityResponse = z.object({
  logs: z.array(BuyerAuditLog),
  total: z.number().int().gte(0).lte(9007199254740991),
});
const UrlAssetSlotInput = z
  .object({
    asset_id: z.string().min(1).max(255),
    url: z.string().url(),
    url_type: z.enum(['clickthrough', 'tracker_pixel', 'tracker_script', 'vast']).optional(),
  })
  .passthrough();
const TextAssetSlotInput = z
  .object({ asset_id: z.string().min(1).max(255), content: z.string().min(1).max(5000) })
  .passthrough();
const CardInput = z
  .object({
    filename: z.string().min(1),
    url: z.string().url(),
    headline: z.string().max(255),
    description: z.string().max(2000),
    cta: z.string().max(50),
    landing_page_url: z.string().url(),
    platform_extensions: z.array(z.object({}).partial().passthrough()),
  })
  .partial()
  .passthrough();
const CreateCreativeManifestMetadata = z
  .object({
    name: z.string().min(1).max(255),
    message: z.string().min(1).max(5000),
    url_asset: z
      .object({
        url: z.string().url(),
        url_type: z.enum(['clickthrough', 'tracker_pixel', 'tracker_script', 'vast']),
      })
      .passthrough(),
    url_assets: z.array(UrlAssetSlotInput).max(50),
    text_assets: z.array(TextAssetSlotInput).max(50),
    webhook_asset: z
      .object({
        url: z.string().url(),
        method: z.enum(['GET', 'POST']).optional(),
        timeout_ms: z.number().int().gte(10).lte(5000).optional(),
        response_type: z.enum(['html', 'json', 'xml', 'javascript']),
        security: z
          .object({
            method: z.enum(['hmac_sha256', 'api_key', 'none']),
            hmac_header: z.string().optional(),
            api_key_header: z.string().optional(),
          })
          .passthrough(),
      })
      .passthrough(),
    format_id: z
      .object({
        agent_url: z.string(),
        id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
        width: z.number().gte(1).optional(),
        height: z.number().gte(1).optional(),
        duration_ms: z.number().gte(1).optional(),
      })
      .passthrough(),
    template_id: z.string(),
    assets: z.array(
      z
        .object({
          filename: z.string().min(1),
          asset_type: z
            .enum([
              'IMAGE',
              'VIDEO',
              'AUDIO',
              'HTML',
              'JAVASCRIPT',
              'CSS',
              'TEXT',
              'URL',
              'VAST',
              'FONT',
              'LOGO',
              'DOCUMENT',
            ])
            .optional(),
          label: z.string().optional(),
          slot_asset_id: z.string().min(1).max(255).optional(),
        })
        .passthrough()
    ),
    frequencyCaps: z.array(
      z
        .object({
          max_impressions: z.number().int().lte(9007199254740991),
          window: z
            .object({
              interval: z.number().gte(1),
              unit: z.union([
                z.literal('seconds'),
                z.literal('minutes'),
                z.literal('hours'),
                z.literal('days'),
                z.literal('campaign'),
              ]),
            })
            .passthrough(),
        })
        .passthrough()
    ),
    cards: z.array(CardInput).min(2).max(10),
  })
  .partial()
  .passthrough();
const ManifestAssetResponse = z.object({
  asset_id: z.string(),
  name: z.string(),
  original_filename: z.string(),
  asset_type: z.enum([
    'IMAGE',
    'VIDEO',
    'AUDIO',
    'HTML',
    'JAVASCRIPT',
    'CSS',
    'TEXT',
    'URL',
    'VAST',
    'FONT',
    'LOGO',
    'DOCUMENT',
  ]),
  content_type: z.string(),
  file_size: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  public_url: z.string().url(),
  asset_source: z.enum(['CREATIVE_SOURCE', 'USER_UPLOADED', 'SYSTEM_PROCESSED']),
  slot_asset_id: z.string().optional(),
  created_at: z.string().datetime({ offset: true }),
});
const CreativeManifestSyncStatus = z.object({
  synced: z.boolean(),
  agent_count: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  last_synced_at: z.string().datetime({ offset: true }).optional(),
});
const CreativeManifestResponse = z.object({
  creative_id: z.string(),
  name: z.string(),
  message: z.string().optional(),
  brand_domain: z.string().optional(),
  template_id: z.string().optional(),
  format_id: z
    .object({
      id: z.string(),
      agent_url: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
      duration_ms: z.number().optional(),
    })
    .passthrough()
    .optional(),
  target_format_ids: z
    .array(
      z
        .object({
          id: z.string(),
          agent_url: z.string(),
          width: z.number().optional(),
          height: z.number().optional(),
          duration_ms: z.number().optional(),
        })
        .passthrough()
    )
    .optional(),
  preview_url: z.string().url().optional(),
  assets: z.array(ManifestAssetResponse),
  html_processing: z
    .object({
      processed_html: z.string().optional(),
      processed_html_url: z.string().url().optional(),
      rewritten_refs: z.array(z.object({ original: z.string(), cdn_url: z.string() })),
      unresolved_refs: z.array(z.string()),
      inserted_macros: z.array(z.string()),
    })
    .optional(),
  auto_detected_template: z
    .object({
      template_id: z.string(),
      template_name: z.string(),
      method: z.enum(['tag_hints', 'html_analysis', 'file_analysis', 'none']),
    })
    .optional(),
  creative_manifest: z.unknown().optional(),
  sync_status: CreativeManifestSyncStatus.optional(),
  tracking: z
    .object({
      impression_tracker_url: z.string().optional(),
      click_tracker_url: z.string().optional(),
      supported_macros: z.array(z.string()),
    })
    .optional(),
  campaign_id: z.string(),
  frequencyCaps: z
    .array(
      z
        .object({
          max_impressions: z.number().int().lte(9007199254740991),
          window: z
            .object({
              interval: z.number().gte(1),
              unit: z.union([
                z.literal('seconds'),
                z.literal('minutes'),
                z.literal('hours'),
                z.literal('days'),
                z.literal('campaign'),
              ]),
            })
            .passthrough(),
          id: z.string(),
          targetLevel: FrequencyCapTargetLevel,
          targetId: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
          archivedAt: z.string().nullish(),
        })
        .passthrough()
    )
    .optional(),
  already_exists: z.boolean().optional(),
  ignored_files: z.number().int().gte(0).lte(9007199254740991).optional(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});
const CreativeManifest = z
  .object({
    format_id: z
      .object({
        agent_url: z.string(),
        id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
        width: z.number().gte(1).optional(),
        height: z.number().gte(1).optional(),
        duration_ms: z.number().gte(1).optional(),
      })
      .passthrough()
      .optional(),
    assets: z.record(
      z.union([
        z.union([
          z
            .object({
              url: z.string().url(),
              width: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
              height: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
              format: z.string().optional(),
              alt_text: z.string().optional(),
            })
            .passthrough(),
          z
            .object({
              url: z.string().url(),
              duration_ms: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
              codec: z.string().optional(),
              bitrate: z.number().optional(),
              width: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
              height: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
              frame_rate: z.number().optional(),
            })
            .passthrough(),
          z
            .object({
              url: z.string().url(),
              duration_ms: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
              codec: z.string().optional(),
              bitrate: z.number().optional(),
            })
            .passthrough(),
          z
            .object({ content: z.string(), url: z.string().url(), version: z.string() })
            .partial()
            .passthrough(),
          z
            .object({ content: z.string(), url: z.string().url(), module_type: z.string() })
            .partial()
            .passthrough(),
          z.object({ content: z.string(), url: z.string().url() }).partial().passthrough(),
          z.object({ content: z.string() }).passthrough(),
          z
            .object({
              url: z.string().url(),
              url_type: z
                .enum(['clickthrough', 'tracker_pixel', 'tracker_script', 'vast'])
                .optional(),
            })
            .passthrough(),
          z
            .object({
              delivery_type: z.enum(['url', 'inline']),
              url: z.string().url(),
              content: z.string(),
              vast_version: z.string(),
              vpaid_enabled: z.boolean(),
              duration_ms: z.number().int().gte(0).lte(9007199254740991),
            })
            .partial()
            .passthrough(),
          z
            .object({
              delivery_type: z.enum(['url', 'inline']),
              url: z.string().url(),
              content: z.string(),
              daast_version: z.string(),
              duration_ms: z.number().int().gte(0).lte(9007199254740991),
              companion_ads: z.boolean(),
            })
            .partial()
            .passthrough(),
          z
            .object({
              url: z.string().url(),
              method: z.enum(['GET', 'POST']).optional().default('POST'),
              timeout_ms: z.number().int().gte(10).lte(5000).optional().default(500),
              response_type: z.enum(['html', 'json', 'xml', 'javascript']),
              security: z
                .object({
                  method: z.enum(['hmac_sha256', 'api_key', 'none']),
                  hmac_header: z.string().optional(),
                  api_key_header: z.string().optional(),
                })
                .passthrough(),
            })
            .passthrough(),
          z.object({ content: z.string(), url: z.string().url() }).partial().passthrough(),
          z.object({}).partial().passthrough(),
        ]),
        z.array(
          z
            .object({
              asset_type: z.literal('card'),
              media: z.union([
                z
                  .object({
                    url: z.string().url(),
                    width: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
                    height: z
                      .number()
                      .int()
                      .gte(-9007199254740991)
                      .lte(9007199254740991)
                      .optional(),
                    format: z.string().optional(),
                    alt_text: z.string().optional(),
                  })
                  .passthrough(),
                z
                  .object({
                    url: z.string().url(),
                    duration_ms: z
                      .number()
                      .int()
                      .gte(-9007199254740991)
                      .lte(9007199254740991)
                      .optional(),
                    codec: z.string().optional(),
                    bitrate: z.number().optional(),
                    width: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
                    height: z
                      .number()
                      .int()
                      .gte(-9007199254740991)
                      .lte(9007199254740991)
                      .optional(),
                    frame_rate: z.number().optional(),
                  })
                  .passthrough(),
              ]),
              headline: z.string().max(255).optional(),
              description: z.string().max(2000).optional(),
              cta: z.string().max(50).optional(),
              landing_page_url: z
                .object({
                  url: z.string().url(),
                  url_type: z
                    .enum(['clickthrough', 'tracker_pixel', 'tracker_script', 'vast'])
                    .optional(),
                })
                .passthrough()
                .optional(),
              platform_extensions: z.array(z.object({}).partial().passthrough()).optional(),
            })
            .passthrough()
        ),
      ])
    ),
    rights: z.array(z.object({}).partial().passthrough()).optional(),
    provenance: z.object({}).partial().passthrough().optional(),
    ext: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const ValidateCreativeBody = z
  .object({
    manifest: CreativeManifest,
    targets: z
      .array(
        z.union([
          z.object({ kind: z.literal('canonical'), id: z.string().min(1) }).passthrough(),
          z.object({ kind: z.literal('product'), id: z.string().min(1) }).passthrough(),
          z.object({ kind: z.literal('third_party_format'), id: z.string().min(1) }).passthrough(),
        ])
      )
      .optional(),
  })
  .passthrough();
const ValidationResult = z.object({
  target: z.object({
    kind: z.enum(['canonical', 'product', 'third_party_format']),
    id: z.string(),
  }),
  result_kind: z.enum(['validated_pass', 'validated_fail', 'unvalidatable_nondeterministic']),
  violations: z
    .array(
      z.object({
        rule: z.string(),
        field: z.string(),
        expected: z.unknown().optional(),
        predicted: z.unknown().optional(),
        retry_with: z.object({}).partial().passthrough().optional(),
      })
    )
    .optional(),
});
const ValidateCreativeResponse = z.object({ results: z.array(ValidationResult) });
const CreativeManifestSummary = z.object({
  creative_id: z.string(),
  campaign_id: z.string(),
  name: z.string(),
  format_id: z
    .object({
      id: z.string(),
      agent_url: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
      duration_ms: z.number().optional(),
    })
    .passthrough()
    .optional(),
  template_id: z.string().optional(),
  brand_domain: z.string().optional(),
  preview_url: z.string().url().optional(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
  asset_count: z.number().int().gte(0).lte(9007199254740991),
  sync_status: z
    .object({
      synced: z.boolean(),
      agent_count: z.number().int().gte(-9007199254740991).lte(9007199254740991),
    })
    .optional(),
  target_format_ids: z
    .array(
      z
        .object({
          id: z.string(),
          agent_url: z.string(),
          width: z.number().optional(),
          height: z.number().optional(),
          duration_ms: z.number().optional(),
        })
        .passthrough()
    )
    .optional(),
});
const CreativeManifestListResponse = z.object({
  manifests: z.array(CreativeManifestSummary),
  total: z.number().int().gte(0).lte(9007199254740991),
});
const UpdateCreativeManifestMetadata = z
  .object({
    name: z.string().min(1).max(255),
    message: z.string().max(5000),
    format_id: z
      .object({
        agent_url: z.string(),
        id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
        width: z.number().gte(1).optional(),
        height: z.number().gte(1).optional(),
        duration_ms: z.number().gte(1).optional(),
      })
      .passthrough(),
    target_format_ids: z.array(
      z
        .object({
          agent_url: z.string(),
          id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
          width: z.number().gte(1).optional(),
          height: z.number().gte(1).optional(),
          duration_ms: z.number().gte(1).optional(),
        })
        .passthrough()
    ),
    template_id: z.string(),
    url_asset: z
      .object({
        url: z.string().url(),
        url_type: z.enum(['clickthrough', 'tracker_pixel', 'tracker_script', 'vast']),
      })
      .passthrough(),
    url_assets: z.array(UrlAssetSlotInput).max(50),
    text_assets: z.array(TextAssetSlotInput).max(50),
    webhook_asset: z
      .object({
        url: z.string().url(),
        method: z.enum(['GET', 'POST']).optional(),
        timeout_ms: z.number().int().gte(10).lte(5000).optional(),
        response_type: z.enum(['html', 'json', 'xml', 'javascript']),
        security: z
          .object({
            method: z.enum(['hmac_sha256', 'api_key', 'none']),
            hmac_header: z.string().optional(),
            api_key_header: z.string().optional(),
          })
          .passthrough(),
      })
      .passthrough(),
    delete_asset_ids: z.array(z.string().min(1)).max(100),
    primary_asset_id: z.string().min(1),
    reclassify_assets: z
      .array(
        z
          .object({
            asset_id: z.string().min(1),
            asset_type: z.enum([
              'IMAGE',
              'VIDEO',
              'AUDIO',
              'HTML',
              'JAVASCRIPT',
              'CSS',
              'TEXT',
              'URL',
              'VAST',
              'FONT',
              'LOGO',
              'DOCUMENT',
            ]),
          })
          .passthrough()
      )
      .max(100),
    new_assets: z.array(
      z
        .object({
          filename: z.string().min(1),
          asset_type: z
            .enum([
              'IMAGE',
              'VIDEO',
              'AUDIO',
              'HTML',
              'JAVASCRIPT',
              'CSS',
              'TEXT',
              'URL',
              'VAST',
              'FONT',
              'LOGO',
              'DOCUMENT',
            ])
            .optional(),
          label: z.string().optional(),
          slot_asset_id: z.string().min(1).max(255).optional(),
        })
        .passthrough()
    ),
    frequencyCaps: z.array(
      z
        .object({
          max_impressions: z.number().int().lte(9007199254740991),
          window: z
            .object({
              interval: z.number().gte(1),
              unit: z.union([
                z.literal('seconds'),
                z.literal('minutes'),
                z.literal('hours'),
                z.literal('days'),
                z.literal('campaign'),
              ]),
            })
            .passthrough(),
        })
        .passthrough()
    ),
  })
  .partial()
  .passthrough();
const EventSourceOutput = z.object({
  eventSourceId: z.string(),
  name: z.string(),
  eventTypes: z
    .array(
      z.enum([
        'page_view',
        'view_content',
        'select_content',
        'select_item',
        'search',
        'share',
        'add_to_cart',
        'remove_from_cart',
        'viewed_cart',
        'add_to_wishlist',
        'initiate_checkout',
        'add_payment_info',
        'purchase',
        'refund',
        'lead',
        'qualify_lead',
        'close_convert_lead',
        'disqualify_lead',
        'complete_registration',
        'subscribe',
        'start_trial',
        'app_install',
        'app_launch',
        'contact',
        'schedule',
        'donate',
        'submit_application',
        'custom',
      ])
    )
    .nullable(),
  allowedDomains: z.array(z.string()).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
const EventSourceListResponse = z.object({
  eventSources: z.array(EventSourceOutput),
  total: z.number().int().gte(0).lte(9007199254740991),
});
const SyncEventSourceObject = z
  .object({
    event_source_id: z.string().min(1).max(255),
    name: z.string().min(1).max(255).optional(),
    event_types: z
      .array(
        z.enum([
          'page_view',
          'view_content',
          'select_content',
          'select_item',
          'search',
          'share',
          'add_to_cart',
          'remove_from_cart',
          'viewed_cart',
          'add_to_wishlist',
          'initiate_checkout',
          'add_payment_info',
          'purchase',
          'refund',
          'lead',
          'qualify_lead',
          'close_convert_lead',
          'disqualify_lead',
          'complete_registration',
          'subscribe',
          'start_trial',
          'app_install',
          'app_launch',
          'contact',
          'schedule',
          'donate',
          'submit_application',
          'custom',
        ])
      )
      .min(1)
      .optional(),
    allowed_domains: z.array(z.string().min(1)).optional(),
  })
  .passthrough();
const SyncEventSourcesRequest = z
  .object({
    account: z.object({ account_id: z.string().min(1) }).passthrough(),
    event_sources: z.array(SyncEventSourceObject).min(1).max(50),
    delete_missing: z.boolean().optional().default(false),
  })
  .passthrough();
const EventSourceSyncResult = z.object({
  event_source_id: z.string(),
  action: z.enum(['created', 'updated', 'unchanged', 'failed', 'deleted']),
  error: z.string().optional(),
});
const SyncEventSourcesResponse = z.object({ event_sources: z.array(EventSourceSyncResult) });
const EventSummaryType = z.enum(['conversion', 'click', 'impression', 'measurement', 'mmp']);
const EventType = EventSummaryType.optional();
const EventSummaryEntry = z.object({
  eventHour: z.string().datetime({ offset: true }),
  EventType: EventSummaryType,
  eventCount: z.number().int().gte(0).lte(9007199254740991),
});
const EventSummaryResponse = z.object({
  periodStart: z.string().datetime({ offset: true }),
  periodEnd: z.string().datetime({ offset: true }),
  entries: z.array(EventSummaryEntry),
  totalEventCount: z.number().int().gte(0).lte(9007199254740991),
});
const UserMatch = z
  .object({
    uids: z.array(
      z.object({ type: z.string().min(1).max(64), value: z.string().min(1).max(512) }).passthrough()
    ),
    hashed_email: z.string().regex(/^[a-f0-9]{64}$/),
    hashed_phone: z.string().regex(/^[a-f0-9]{64}$/),
    click_id: z.string().max(512),
    click_id_type: z.string().max(64),
    client_ip: z.string().max(45),
    client_user_agent: z.string().max(512),
  })
  .partial()
  .passthrough();
const ContentItem = z
  .object({
    id: z.string().max(256),
    quantity: z.number().int().lte(9007199254740991),
    price: z.number(),
    brand: z.string().max(256),
  })
  .partial()
  .passthrough();
const CustomData = z
  .object({
    value: z.number(),
    currency: z.string().regex(/^[A-Z]{3}$/),
    order_id: z.string().max(256),
    content_ids: z.array(z.string().max(256)),
    content_type: z.string().max(128),
    num_items: z.number().int().gte(0).lte(9007199254740991),
    contents: z.array(ContentItem),
  })
  .partial()
  .passthrough();
const LogEventObject = z
  .object({
    event_id: z.string().min(1).max(256),
    event_type: z.enum([
      'purchase',
      'lead',
      'add_to_cart',
      'initiate_checkout',
      'view_content',
      'complete_registration',
      'page_view',
      'app_install',
      'deposit',
      'subscription',
      'custom',
    ]),
    event_time: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|([+-](?:[01]\d|2[0-3]):[0-5]\d)))$/
      )
      .datetime({ offset: true }),
    user_match: UserMatch.optional(),
    custom_data: CustomData.optional(),
    action_source: z
      .enum(['website', 'app', 'in_store', 'phone_call', 'system_generated', 'other'])
      .optional(),
    event_source_url: z.string().url().optional(),
    custom_event_name: z.string().max(256).optional(),
  })
  .passthrough();
const LogEventRequest = z
  .object({
    event_source_id: z.string().min(1).max(256),
    events: z.array(LogEventObject).min(1).max(10000),
    test_event_code: z.string().max(256).optional(),
  })
  .passthrough();
const LogEventPartialFailure = z.object({
  event_id: z.string(),
  code: z.string(),
  message: z.string(),
});
const LogEventResponse = z.object({
  events_received: z.number().int().gte(0).lte(9007199254740991),
  events_processed: z.number().int().gte(0).lte(9007199254740991),
  partial_failures: z.array(LogEventPartialFailure).optional(),
  warnings: z.array(z.string()).optional(),
  match_quality: z.number().gte(0).lte(1).optional(),
});
const SyncMeasurementObject = z
  .object({
    start_time: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|([+-](?:[01]\d|2[0-3]):[0-5]\d)))$/
      )
      .datetime({ offset: true }),
    end_time: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|([+-](?:[01]\d|2[0-3]):[0-5]\d)))$/
      )
      .datetime({ offset: true }),
    metric_id: z.enum([
      'revenue',
      'incremental_revenue',
      'conversions',
      'incremental_conversions',
      'page_view_count',
      'add_to_cart_count',
      'purchase_count',
      'ltv_1d',
      'ltv_7d',
      'ltv_30d',
    ]),
    metric_value: z.number(),
    unit: z.enum(['currency', 'count', 'ratio', 'percentage']),
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .optional(),
    campaign_id: z.string().min(1).max(255).optional(),
    media_buy_id: z.string().min(1).max(255).optional(),
    package_id: z.string().min(1).max(255).optional(),
    creative_id: z.string().min(1).max(255).optional(),
    source: z.enum(['advertiser', 'mmp', 'measurement_partner']).optional(),
    source_platform: z.string().min(1).max(255).optional(),
    source_metric_name: z.string().min(1).max(255).optional(),
    external_row_id: z.string().min(1).max(255).optional(),
  })
  .passthrough();
const SyncMeasurementDataRequest = z
  .object({ measurements: z.array(SyncMeasurementObject).min(1).max(1000) })
  .passthrough();
const MeasurementDataSyncResult = z.object({
  index: z.number().int().gte(0).lte(9007199254740991),
  action: z.enum(['created', 'updated', 'unchanged', 'failed']),
  error: z.string().optional(),
});
const SyncMeasurementDataResponse = z.object({ measurements: z.array(MeasurementDataSyncResult) });
const TestCohortSummary = z.object({
  id: z.string(),
  advertiserId: z.string(),
  name: z.string(),
  cohortType: z.string(),
  role: z.enum(['TREATMENT', 'CONTROL', 'OBSERVATION']),
  estimatedSize: z.number().int().gte(0).lte(9007199254740991).optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
const TestCohortListResponse = z.object({
  cohorts: z.array(TestCohortSummary),
  total: z.number().int().gte(0).lte(9007199254740991),
});
const CohortDefinition = z.object({ type: z.string().min(1) }).passthrough();
const CreateTestCohortInput = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    cohortType: z.string().min(1),
    role: z.enum(['TREATMENT', 'CONTROL', 'OBSERVATION']).optional().default('TREATMENT'),
    definition: CohortDefinition,
    estimatedSize: z.number().int().gte(0).lte(9007199254740991).optional(),
  })
  .passthrough();
const TestCohortOutput = z.object({
  id: z.string(),
  advertiserId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  cohortType: z.string(),
  role: z.enum(['TREATMENT', 'CONTROL', 'OBSERVATION']),
  definition: CohortDefinition,
  estimatedSize: z.number().int().gte(0).lte(9007199254740991).optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
const TestCohortResponse = z.object({ cohort: TestCohortOutput });
const UpdateTestCohortInput = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000),
    cohortType: z.string().min(1),
    role: z.enum(['TREATMENT', 'CONTROL', 'OBSERVATION']),
    definition: CohortDefinition,
    estimatedSize: z.number().int().gte(0).lte(9007199254740991),
  })
  .partial()
  .passthrough();
const MmmConfig = z
  .object({
    provider: z.string(),
    dataSourceIds: z.array(z.string()),
    reportingFrequency: z.enum(['weekly', 'monthly', 'quarterly']),
  })
  .partial()
  .passthrough();
const MeasurementConfigOutput = z.object({
  advertiserId: z.string(),
  mmmEnabled: z.boolean(),
  mmmConfig: MmmConfig.optional(),
  incrementalityTestingEnabled: z.boolean(),
  brandLiftEnabled: z.boolean(),
  settings: z.object({}).partial().passthrough().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
const MeasurementConfigResponse = z.object({ measurementConfig: MeasurementConfigOutput });
const UpdateMeasurementConfigInput = z
  .object({
    mmmEnabled: z.boolean(),
    mmmConfig: MmmConfig,
    incrementalityTestingEnabled: z.boolean(),
    brandLiftEnabled: z.boolean(),
    settings: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const CreateMeasurementSourceBody = z
  .object({
    sourceKey: z.string().min(1),
    name: z.string().min(1),
    outcomeType: z.string().min(1),
    outcomeTypes: z.array(z.string()).optional(),
    granularity: z.string().min(1),
    lagWeeks: z.number().int().gte(0).lte(9007199254740991).optional().default(1),
    cadence: z.enum(['continuous', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly']),
    provider: z.string().min(1),
    ingestionMethod: z.string().optional(),
    attributionConfig: z.object({}).partial().passthrough().optional(),
    signalWeight: z.number().gte(0).lte(1).optional().default(1),
    Status: z.enum(['pending', 'active', 'paused']).optional().default('pending'),
    notes: z.string().optional(),
  })
  .passthrough();
const UpdateMeasurementSourceBody = z
  .object({
    name: z.string().min(1),
    outcomeType: z.string().min(1),
    outcomeTypes: z.array(z.string()),
    granularity: z.string().min(1),
    lagWeeks: z.number().int().gte(0).lte(9007199254740991).default(1),
    cadence: z.enum(['continuous', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly']),
    provider: z.string().min(1),
    ingestionMethod: z.string(),
    attributionConfig: z.object({}).partial().passthrough(),
    signalWeight: z.number().gte(0).lte(1).default(1),
    Status: z.enum(['pending', 'active', 'paused']).default('pending'),
    notes: z.string(),
  })
  .partial()
  .passthrough();
const UploadMeasurementRecordsBody = z
  .object({
    records: z
      .array(
        z
          .object({
            outcomeType: z.string().min(1),
            geo: z.string().min(1),
            timeWindowStart: z
              .string()
              .regex(
                /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))$/
              ),
            timeWindowEnd: z
              .string()
              .regex(
                /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))$/
              ),
            value: z.number(),
            baselineValue: z.number().optional(),
            confidenceInterval: z.number().optional(),
            source: z.string().min(1),
            lagDays: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
          })
          .passthrough()
      )
      .min(1)
      .max(5000),
  })
  .passthrough();
const UploadContextRecordsBody = z
  .object({
    records: z
      .array(
        z
          .object({
            geo: z.string().min(1),
            timeWindowStart: z
              .string()
              .regex(
                /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))$/
              ),
            timeWindowEnd: z
              .string()
              .regex(
                /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))$/
              ),
            promoActive: z.boolean().optional().default(false),
            promoType: z.string().optional(),
            temperatureAvg: z.number().optional(),
            competitorActivity: z.object({}).partial().passthrough().optional(),
            seasonalityIndex: z.number().optional(),
            flightStatus: z
              .enum(['active', 'dark', 'pre_flight', 'post_flight'])
              .optional()
              .default('active'),
          })
          .passthrough()
      )
      .min(1)
      .max(5000),
  })
  .passthrough();
const ReportingMetrics = z.object({
  impressions: z.number().int().gte(0).lte(9007199254740991),
  spend: z.number().gte(0),
  clicks: z.number().int().gte(0).lte(9007199254740991),
  views: z.number().int().gte(0).lte(9007199254740991),
  completedViews: z.number().int().gte(0).lte(9007199254740991),
  conversions: z.number().int().gte(0).lte(9007199254740991),
  leads: z.number().int().gte(0).lte(9007199254740991),
  videoCompletions: z.number().int().gte(0).lte(9007199254740991),
  ecpm: z.number().nullable(),
  cpc: z.number().nullable(),
  ctr: z.number().nullable(),
  completionRate: z.number().nullable(),
});
const PackageReporting = z.object({
  packageId: z.string(),
  productId: z.string().nullable(),
  productName: z.string().nullable(),
  metrics: ReportingMetrics,
});
const MediaBuyReporting = z.object({
  MediaBuyId: z.string(),
  name: z.string(),
  Status: z.string(),
  budget: z.number().nullable(),
  metrics: ReportingMetrics,
  packages: z.array(PackageReporting),
});
const CampaignReporting = z.object({
  campaignId: z.string(),
  campaignName: z.string(),
  metrics: ReportingMetrics,
  mediaBuys: z.array(MediaBuyReporting),
});
const AdvertiserReporting = z.object({
  advertiserId: z.string(),
  advertiserName: z.string(),
  metrics: ReportingMetrics,
  campaigns: z.array(CampaignReporting),
});
const ReportingMetricsResponse = z.object({
  advertisers: z.array(AdvertiserReporting),
  totals: ReportingMetrics,
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
const CurrentAccountResponse = z.object({
  id: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  company: z.string(),
  name: z.string(),
  role: z.string().optional(),
  customerDomain: z.string().nullable(),
});
const OrgAccountSummary = z.object({
  id: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  company: z.string(),
  name: z.string(),
  role: z.string().optional(),
});
const ListCustomerAccountsResponse = z.object({ accounts: z.array(OrgAccountSummary) });
const CreateChildAccountBody = z
  .object({
    name: z.string().min(1).max(255),
    customerRole: z.enum(['BUYER', 'SELLER']),
    parentName: z.string().min(1).max(255).optional(),
    customerDomain: z
      .string()
      .max(255)
      .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/)
      .optional(),
  })
  .passthrough();
const CreateChildAccountResponse = z.object({
  user: z.object({}).partial().passthrough(),
  customer: z.object({}).partial().passthrough(),
  customers: z.array(z.object({}).partial().passthrough()),
  showTosBox: z.boolean(),
  organizationContractMissing: z.boolean().optional(),
  hasContract: z.boolean(),
  latestTosVersion: z.string(),
  convertedFromStandalone: z.boolean(),
});
const UpdateCustomerDomainBody = z
  .object({
    customerDomain: z
      .string()
      .max(255)
      .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/),
  })
  .passthrough();
const UpdateCustomerDomainResponse = z.object({
  id: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  customerDomain: z.string().nullable(),
});
const MembershipSettingsResponse = z.object({
  customerId: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  allowDomainAutoJoin: z.boolean(),
});
const UpdateMembershipSettingsBody = z.object({ allowDomainAutoJoin: z.boolean() }).passthrough();
const UpdateNotificationPreferencesBody = z
  .object({
    optIns: z
      .array(
        z
          .object({
            notificationType: z.enum([
              'brand_agent.created',
              'brand_agent.updated',
              'brand_agent.deleted',
              'campaign.healthy',
              'campaign.unhealthy',
              'campaign.created',
              'campaign.updated',
              'campaign.deleted',
              'campaign.completed',
              'creative.approved',
              'creative.rejected',
              'creative.changes_requested',
              'creative.sync_started',
              'creative.sync_completed',
              'creative.sync_failed',
              'creative.created',
              'creative.updated',
              'creative.deleted',
              'strategy.created',
              'strategy.updated',
              'strategy.deleted',
              'media_buy.created',
              'media_buy.updated',
              'media_buy.deleted',
              'salesagent.available',
              'salesagent.unavailable',
              'salesagent.registered',
              'salesagent.unregistered',
              'salesagent.updated',
              'signalsagent.registered',
              'signalsagent.unregistered',
              'signalsagent.updated',
              'signalsagent.signal_activated',
              'signalsagent.signals_fetched',
              'outcomesagent.registered',
              'outcomesagent.unregistered',
              'outcomesagent.updated',
              'syndication.completed',
              'syndication.failed',
              'audience.synced',
              'audience.sync_failed',
              'optimization.suggestion_received',
              'optimization.suggestion_approved',
              'optimization.suggestion_rejected',
              'optimization.suggestion_applied',
              'optimization.suggestion_failed',
              'system.warning',
              'system.error',
              'learning_cycle.completed',
              'learning_cycle.failed',
              'hypothesis.status_changed',
              'hypothesis.review_requested',
              'hypothesis.proven',
              'hypothesis.disproven',
              'measurement.received',
              'measurement.stale',
              'opportunity.evaluated',
              'opportunity.recommended',
              'opportunity.flagged',
              'opportunity.explore',
            ]),
            channel: z.enum(['email', 'in_app']),
          })
          .passthrough()
      )
      .max(200),
  })
  .passthrough();
const CheckModerationBody = z
  .object({
    text: z.string().min(1).max(10000),
    direction: z.enum(['input', 'output']).optional().default('input'),
    surface: z.string().min(1).max(100).optional().default('moderation.check'),
  })
  .passthrough();
const AvailableAccountOutput = z.object({
  accountId: z.string(),
  name: z.string().nullish(),
  advertiser: z.string().nullish(),
  billingProxy: z.string().nullish(),
  house: z.string().nullish(),
  billing: z.string().nullish(),
  sources: z.array(BuyerCredentialSourceRef),
  Status: z.enum(['active', 'pending_approval', 'payment_required', 'suspended', 'closed']),
});
const AvailableAccountListResponse = z.object({
  accounts: z.array(AvailableAccountOutput),
  total: z.number().int().gte(0).lte(9007199254740991),
  synced: z.boolean().optional(),
  billingOptions: z
    .object({ default: z.string().nullable(), supported: z.array(z.string()) })
    .optional(),
});
const ReportingBucket = z
  .object({
    protocol: z.enum(['s3', 'gcs', 'azure_blob']),
    bucket: z
      .string()
      .min(3)
      .max(63)
      .regex(/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/),
    prefix: z
      .string()
      .max(512)
      .regex(/^[a-zA-Z0-9\/_.-]+$/)
      .optional(),
    region: z
      .string()
      .max(64)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    format: z.enum(['jsonl', 'csv', 'parquet', 'avro', 'orc']).optional().default('jsonl'),
    compression: z.enum(['gzip', 'none']).optional().default('gzip'),
    file_retention_days: z.number().int().gte(1).lte(9007199254740991),
    setup_instructions: z.string().url().optional(),
  })
  .passthrough();
const UpdateReportingBucketBody = z
  .object({ reporting_bucket: ReportingBucket.nullable() })
  .passthrough();
const AccountOutput = z.object({
  linkId: z.string(),
  accountId: z.string(),
  name: z.string().nullish(),
  advertiser: z.string().nullish(),
  billingProxy: z.string().nullish(),
  house: z.string().nullish(),
  billing: z.string().nullish(),
  sources: z.array(BuyerCredentialSourceRef),
  advertiserId: z.string(),
  Status: z.enum(['active', 'pending_approval', 'payment_required', 'suspended', 'closed']),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
const AccountResponse = z.object({ account: AccountOutput });
const SyncCatalogsBody = z
  .object({
    account: z.object({ account_id: z.string().min(1) }).passthrough(),
    catalogs: z
      .array(
        z
          .object({
            catalog_id: z.string().min(1),
            type: z.enum([
              'offering',
              'product',
              'inventory',
              'store',
              'promotion',
              'hotel',
              'flight',
              'job',
              'vehicle',
              'real_estate',
              'education',
              'destination',
            ]),
            name: z.string().min(1).max(255).optional(),
            url: z.string().url().optional(),
            feed_format: z
              .enum([
                'google_merchant_center',
                'facebook_catalog',
                'shopify',
                'linkedin_jobs',
                'custom',
              ])
              .optional(),
            update_frequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']).optional(),
            items: z.array(z.object({}).partial().passthrough()).max(10000).optional(),
            conversion_events: z.array(z.string()).optional(),
          })
          .passthrough()
      )
      .min(1)
      .max(50),
    catalog_ids: z.array(z.string()).optional(),
    delete_missing: z.boolean().optional().default(false),
    dry_run: z.boolean().optional().default(false),
    validation_mode: z.enum(['strict', 'lenient']).optional().default('strict'),
  })
  .passthrough();
const BuyerStorefrontSummary = z.object({
  id: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  platformId: z.string(),
  name: z.string(),
  publisherDomain: z.string().nullable(),
  displayStatus: z.enum(['configuring', 'transacting', 'archived']),
  channels: z.array(z.string()),
  sourceCount: z.number().int().gte(0).lte(9007199254740991),
  connectedSourceCount: z.number().int().gte(0).lte(9007199254740991),
});
const BuyerStorefrontList = z.object({
  items: z.array(BuyerStorefrontSummary),
  total: z.number().int().gte(0).lte(9007199254740991),
  hasMore: z.boolean(),
  nextOffset: z.number().int().gte(0).lte(9007199254740991).nullable(),
});
const BuyerStorefrontSource = z.object({
  sourceId: z.string(),
  name: z.string(),
  requiresCredentials: z.boolean(),
  connected: z.boolean(),
  customerAccounts: z.array(z.object({ accountIdentifier: z.string(), Status: z.string() })),
});
const BuyerStorefront = z.object({
  id: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  platformId: z.string(),
  name: z.string(),
  publisherDomain: z.string().nullable(),
  displayStatus: z.enum(['configuring', 'transacting', 'archived']),
  channels: z.array(z.string()),
  sources: z.array(BuyerStorefrontSource),
});
const BuyerCredential = z.object({
  id: z.string(),
  accountIdentifier: z.string(),
  accountType: z.string(),
  Status: z.string(),
  registeredBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sources: z.array(BuyerCredentialSourceRef),
});
const RegisterSourceCredentialsBody = z
  .object({
    accountIdentifier: z.string().min(1).max(255),
    auth: z
      .union([
        z
          .object({
            type: z.literal('jwt'),
            privateKey: z.string().min(1),
            issuer: z.string().min(1),
            subject: z.string().min(1),
            keyId: z.string().min(1),
            scope: z.string().min(1),
            tokenEndpointUrl: z.string().url(),
            audienceUrl: z.string().url(),
            algorithm: z.enum(['ES256', 'RS256']).optional(),
            environment: z.string().optional(),
          })
          .passthrough(),
        z
          .object({ type: z.enum(['bearer', 'apikey', 'api_key']), token: z.string().min(1) })
          .passthrough(),
        z.object({}).partial().passthrough(),
      ])
      .optional(),
    marketplaceAccount: z.boolean().optional(),
  })
  .passthrough();
const BuyerCredentialOAuthInfo = z.object({
  authorizationUrl: z.string().url(),
  storefrontId: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  sourceId: z.string(),
  sourceName: z.string(),
});
const BuyerCredentialRegistrationResponse = z.object({
  id: z.string(),
  accountIdentifier: z.string(),
  Status: z.string(),
  registeredBy: z.string().nullable(),
  createdAt: z.string(),
  oauth: BuyerCredentialOAuthInfo.optional(),
});
const SyndicateBody = z
  .object({
    resourceType: z.enum(['AUDIENCE', 'EVENT_SOURCE', 'CATALOG']),
    resourceId: z.string().min(1),
    adcpAgentIds: z.array(z.string().min(1)).min(1),
    enabled: z.boolean(),
  })
  .passthrough();
const SyndicationStatusOutput = z.object({
  id: z.string(),
  customerId: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  seatId: z.string(),
  resourceType: z.enum(['AUDIENCE', 'EVENT_SOURCE', 'CATALOG']),
  resourceId: z.string(),
  audienceId: z.string().nullable(),
  eventSourceId: z.string().nullable(),
  catalogId: z.string().nullable(),
  adcpAgentId: z.string(),
  adcpAgentAccountId: z.string().nullable(),
  enabled: z.boolean(),
  Status: z.enum(['PENDING', 'SYNCING', 'COMPLETED', 'FAILED', 'DISABLED']),
  errorMessage: z.string().nullable(),
  responseData: z.unknown().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable(),
});
const SyndicateResponse = z.object({ data: z.array(SyndicationStatusOutput) });
const SyndicationStatusListResponse = z.object({
  items: z.array(SyndicationStatusOutput),
  total: z.number().int().gte(0).lte(9007199254740991),
});
const RemoveMember = z
  .object({
    externalId: z.string().min(1),
    hashedEmail: z
      .string()
      .regex(/^[0-9a-f]{64}$/)
      .optional(),
    hashedPhone: z
      .string()
      .regex(/^[0-9a-f]{64}$/)
      .optional(),
    uids: z
      .array(z.object({ type: z.string().min(1), value: z.string().min(1) }).passthrough())
      .min(1)
      .optional(),
  })
  .passthrough();
const AudienceItem = z
  .object({
    audienceId: z.string().min(1).max(255),
    name: z.string().max(255).optional(),
    add: z
      .array(
        z
          .object({
            externalId: z.string().min(1),
            hashedEmail: z
              .string()
              .regex(/^[0-9a-f]{64}$/)
              .optional(),
            hashedPhone: z
              .string()
              .regex(/^[0-9a-f]{64}$/)
              .optional(),
            uids: z
              .array(z.object({ type: z.string().min(1), value: z.string().min(1) }).passthrough())
              .min(1)
              .optional(),
          })
          .passthrough()
      )
      .max(100000)
      .optional(),
    remove: z.array(RemoveMember).max(100000).optional(),
    delete: z.boolean().optional(),
    consentBasis: z
      .enum(['consent', 'legitimate_interest', 'contract', 'legal_obligation'])
      .optional(),
  })
  .passthrough();
const SyncAudiencesBody = z
  .object({
    audiences: z.array(AudienceItem).min(1),
    deleteMissing: z.boolean().optional(),
    pushNotificationConfig: z
      .object({
        url: z.string(),
        operation_id: z
          .string()
          .min(1)
          .max(255)
          .regex(/^[A-Za-z0-9_.:-]{1,255}$/)
          .optional(),
        token: z.string().min(16).max(4096).optional(),
        authentication: z
          .object({
            schemes: z.array(z.union([z.literal('Bearer'), z.literal('HMAC-SHA256')])),
            credentials: z.string().min(32),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();
const SyncAudiencesResponse = z.object({
  success: z.boolean(),
  accountId: z.string(),
  operationId: z
    .string()
    .regex(
      /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/
    )
    .uuid(),
  taskId: z
    .string()
    .regex(
      /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/
    )
    .uuid(),
});
const AudienceSummary = z.object({
  audienceId: z.string(),
  name: z.string().nullable(),
  accountId: z.string(),
  Status: z.enum(['PROCESSING', 'ERROR', 'READY', 'TOO_SMALL']),
  deleted: z.boolean(),
  uploadedCount: z.number().nullable(),
  matchedCount: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const AudienceListResponse = z.object({
  audiences: z.array(AudienceSummary),
  total: z.number(),
  take: z.number(),
  skip: z.number(),
});
const TaskError = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  suggestion: z.string().optional(),
  retryAfter: z.number().optional(),
  details: z.object({}).partial().passthrough().optional(),
  recovery: z.enum(['transient', 'correctable', 'terminal']).optional(),
});
const TaskOutput = z.object({
  taskId: z
    .string()
    .regex(
      /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/
    )
    .uuid(),
  taskType: z.enum(['audience_sync', 'media_buy_create', 'creative_sync']),
  Status: z.enum(['submitted', 'working', 'completed', 'failed', 'input-required']),
  resourceType: z.string().nullable(),
  resourceId: z.string().nullable(),
  error: TaskError.nullable(),
  response: z.object({}).partial().passthrough().nullable(),
  metadata: z.object({}).partial().passthrough().nullable(),
  retryAfterSeconds: z.number().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
const TaskResponse = z.object({ task: TaskOutput });
const PropertyListSummary = z.object({
  listId: z.string(),
  name: z.string(),
  purpose: z.enum(['include', 'exclude']),
  propertyCount: z.number().int().gte(0).lte(9007199254740991),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
const PropertyListListResponse = z.object({
  propertyLists: z.array(PropertyListSummary),
  total: z.number().int().gte(0).lte(9007199254740991),
});
const PropertyListFilters = z
  .object({
    channels_any: z
      .array(
        z.enum([
          'display',
          'olv',
          'social',
          'search',
          'ctv',
          'linear_tv',
          'radio',
          'streaming_audio',
          'podcast',
          'dooh',
          'ooh',
          'print',
          'cinema',
          'email',
          'gaming',
          'retail_media',
          'influencer',
          'affiliate',
          'product_placement',
        ])
      )
      .nullable(),
    countries_all: z.array(z.string().min(2).max(2)).nullable(),
    property_types: z
      .array(
        z.enum([
          'website',
          'mobile_app',
          'ctv_app',
          'desktop_app',
          'dooh',
          'podcast',
          'radio',
          'streaming_audio',
        ])
      )
      .nullable(),
    feature_requirements: z
      .array(
        z
          .object({
            feature_id: z.string(),
            min_value: z.number().nullish(),
            max_value: z.number().nullish(),
            allowed_values: z.array(z.unknown()).nullish(),
            if_not_covered: z.enum(['exclude', 'include']).nullish(),
          })
          .passthrough()
      )
      .nullable(),
  })
  .partial()
  .passthrough();
const CreatePropertyListInput = z
  .object({
    name: z.string().min(1).max(255),
    purpose: z.enum(['include', 'exclude']),
    domains: z.array(z.string().min(1)).max(100000).optional(),
    identifiers: z
      .array(
        z
          .object({
            type: z.union([
              z.literal('domain'),
              z.literal('subdomain'),
              z.literal('network_id'),
              z.literal('ios_bundle'),
              z.literal('android_package'),
              z.literal('apple_app_store_id'),
              z.literal('google_play_id'),
              z.literal('roku_store_id'),
              z.literal('fire_tv_asin'),
              z.literal('samsung_app_id'),
              z.literal('apple_tv_bundle'),
              z.literal('bundle_id'),
              z.literal('venue_id'),
              z.literal('screen_id'),
              z.literal('openooh_venue_type'),
              z.literal('rss_url'),
              z.literal('apple_podcast_id'),
              z.literal('spotify_collection_id'),
              z.literal('podcast_guid'),
              z.literal('station_id'),
              z.literal('facility_id'),
            ]),
            value: z.string(),
          })
          .passthrough()
      )
      .max(100000)
      .optional(),
    filters: PropertyListFilters.nullish(),
  })
  .passthrough();
const PropertyListResolutionSummary = z.object({
  totalRequested: z.number().int().gte(0).lte(9007199254740991),
  resolvedCount: z.number().int().gte(0).lte(9007199254740991),
  registeredCount: z.number().int().gte(0).lte(9007199254740991),
  unresolvedCount: z.number().int().gte(0).lte(9007199254740991),
  resolutionRate: z.number().gte(0).lte(1),
});
const PropertyListCascadeSummary = z.object({
  totalMediaBuys: z.number().int().gte(0).lte(9007199254740991),
  updatedCount: z.number().int().gte(0).lte(9007199254740991),
  failedCount: z.number().int().gte(0).lte(9007199254740991),
});
const PropertyListFiltersOutput = z
  .object({
    channels_any: z
      .array(
        z.enum([
          'display',
          'olv',
          'social',
          'search',
          'ctv',
          'linear_tv',
          'radio',
          'streaming_audio',
          'podcast',
          'dooh',
          'ooh',
          'print',
          'cinema',
          'email',
          'gaming',
          'retail_media',
          'influencer',
          'affiliate',
          'product_placement',
        ])
      )
      .nullable(),
    countries_all: z.array(z.string().min(2).max(2)).nullable(),
    property_types: z
      .array(
        z.enum([
          'website',
          'mobile_app',
          'ctv_app',
          'desktop_app',
          'dooh',
          'podcast',
          'radio',
          'streaming_audio',
        ])
      )
      .nullable(),
    feature_requirements: z
      .array(
        z.object({
          feature_id: z.string(),
          min_value: z.number().nullish(),
          max_value: z.number().nullish(),
          allowed_values: z.array(z.unknown()).nullish(),
          if_not_covered: z.enum(['exclude', 'include']).nullish(),
        })
      )
      .nullable(),
  })
  .partial();
const PropertyListOutput = z.object({
  listId: z.string(),
  name: z.string(),
  purpose: z.enum(['include', 'exclude']),
  identifiers: z.array(
    z
      .object({
        type: z.union([
          z.literal('domain'),
          z.literal('subdomain'),
          z.literal('network_id'),
          z.literal('ios_bundle'),
          z.literal('android_package'),
          z.literal('apple_app_store_id'),
          z.literal('google_play_id'),
          z.literal('roku_store_id'),
          z.literal('fire_tv_asin'),
          z.literal('samsung_app_id'),
          z.literal('apple_tv_bundle'),
          z.literal('bundle_id'),
          z.literal('venue_id'),
          z.literal('screen_id'),
          z.literal('openooh_venue_type'),
          z.literal('rss_url'),
          z.literal('apple_podcast_id'),
          z.literal('spotify_collection_id'),
          z.literal('podcast_guid'),
          z.literal('station_id'),
          z.literal('facility_id'),
        ]),
        value: z.string(),
      })
      .passthrough()
  ),
  unresolvedIdentifiers: z.array(
    z
      .object({
        type: z.union([
          z.literal('domain'),
          z.literal('subdomain'),
          z.literal('network_id'),
          z.literal('ios_bundle'),
          z.literal('android_package'),
          z.literal('apple_app_store_id'),
          z.literal('google_play_id'),
          z.literal('roku_store_id'),
          z.literal('fire_tv_asin'),
          z.literal('samsung_app_id'),
          z.literal('apple_tv_bundle'),
          z.literal('bundle_id'),
          z.literal('venue_id'),
          z.literal('screen_id'),
          z.literal('openooh_venue_type'),
          z.literal('rss_url'),
          z.literal('apple_podcast_id'),
          z.literal('spotify_collection_id'),
          z.literal('podcast_guid'),
          z.literal('station_id'),
          z.literal('facility_id'),
        ]),
        value: z.string(),
      })
      .passthrough()
  ),
  registeredIdentifiers: z.array(
    z
      .object({
        type: z.union([
          z.literal('domain'),
          z.literal('subdomain'),
          z.literal('network_id'),
          z.literal('ios_bundle'),
          z.literal('android_package'),
          z.literal('apple_app_store_id'),
          z.literal('google_play_id'),
          z.literal('roku_store_id'),
          z.literal('fire_tv_asin'),
          z.literal('samsung_app_id'),
          z.literal('apple_tv_bundle'),
          z.literal('bundle_id'),
          z.literal('venue_id'),
          z.literal('screen_id'),
          z.literal('openooh_venue_type'),
          z.literal('rss_url'),
          z.literal('apple_podcast_id'),
          z.literal('spotify_collection_id'),
          z.literal('podcast_guid'),
          z.literal('station_id'),
          z.literal('facility_id'),
        ]),
        value: z.string(),
      })
      .passthrough()
  ),
  domains: z.array(z.string()),
  unresolvedDomains: z.array(z.string()),
  registeredDomains: z.array(z.string()),
  propertyCount: z.number().int().gte(0).lte(9007199254740991),
  resolutionSummary: PropertyListResolutionSummary.optional(),
  cascadeSummary: PropertyListCascadeSummary.optional(),
  filters: PropertyListFiltersOutput.nullish(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  Status: z.enum(['processing', 'ready', 'failed']).optional(),
  errorMessage: z.string().optional(),
});
const PropertyListResponse = z.object({ propertyList: PropertyListOutput });
const UpdatePropertyListInput = z
  .object({
    name: z.string().min(1).max(255),
    domains: z.array(z.string().min(1)).max(100000),
    identifiers: z
      .array(
        z
          .object({
            type: z.union([
              z.literal('domain'),
              z.literal('subdomain'),
              z.literal('network_id'),
              z.literal('ios_bundle'),
              z.literal('android_package'),
              z.literal('apple_app_store_id'),
              z.literal('google_play_id'),
              z.literal('roku_store_id'),
              z.literal('fire_tv_asin'),
              z.literal('samsung_app_id'),
              z.literal('apple_tv_bundle'),
              z.literal('bundle_id'),
              z.literal('venue_id'),
              z.literal('screen_id'),
              z.literal('openooh_venue_type'),
              z.literal('rss_url'),
              z.literal('apple_podcast_id'),
              z.literal('spotify_collection_id'),
              z.literal('podcast_guid'),
              z.literal('station_id'),
              z.literal('facility_id'),
            ]),
            value: z.string(),
          })
          .passthrough()
      )
      .max(100000),
  })
  .partial()
  .passthrough();
const EmptyResponse = z.object({}).partial();
const CheckPropertyListBody = z
  .object({
    domains: z.array(z.string().min(1)).max(100000),
    identifiers: z
      .array(
        z
          .object({
            type: z.union([
              z.literal('domain'),
              z.literal('subdomain'),
              z.literal('network_id'),
              z.literal('ios_bundle'),
              z.literal('android_package'),
              z.literal('apple_app_store_id'),
              z.literal('google_play_id'),
              z.literal('roku_store_id'),
              z.literal('fire_tv_asin'),
              z.literal('samsung_app_id'),
              z.literal('apple_tv_bundle'),
              z.literal('bundle_id'),
              z.literal('venue_id'),
              z.literal('screen_id'),
              z.literal('openooh_venue_type'),
              z.literal('rss_url'),
              z.literal('apple_podcast_id'),
              z.literal('spotify_collection_id'),
              z.literal('podcast_guid'),
              z.literal('station_id'),
              z.literal('facility_id'),
            ]),
            value: z.string(),
          })
          .passthrough()
      )
      .max(100000),
  })
  .partial()
  .passthrough();
const BuyerInvoiceItem = z.object({
  id: z.string(),
  number: z.string().nullable(),
  Status: z.string().nullable(),
  currency: z.string(),
  amountDue: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  amountPaid: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  amountRemaining: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  total: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  created: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  dueDate: z.number().int().gte(-9007199254740991).lte(9007199254740991).nullable(),
  periodStart: z.number().int().gte(-9007199254740991).lte(9007199254740991).nullable(),
  periodEnd: z.number().int().gte(-9007199254740991).lte(9007199254740991).nullable(),
  hostedInvoiceUrl: z.string().nullable(),
  invoicePdf: z.string().nullable(),
  description: z.string().nullable(),
  customerEmail: z.string().nullish(),
  customerName: z.string().nullish(),
});
const BuyerInvoicesResponse = z.object({
  invoices: z.array(BuyerInvoiceItem),
  hasMore: z.boolean(),
  cursor: z.string().nullable(),
});
const BuyerPendingInvoiceItem = z.object({
  id: z.string(),
  description: z.string().nullable(),
  currency: z.string(),
  amount: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  quantity: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  unitAmount: z.number().int().gte(-9007199254740991).lte(9007199254740991).nullable(),
  date: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  period: z.object({
    start: z.number().int().gte(-9007199254740991).lte(9007199254740991),
    end: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  }),
  proration: z.boolean(),
  customerId: z.string().nullish(),
});
const BuyerPendingInvoiceItemsResponse = z.object({
  items: z.array(BuyerPendingInvoiceItem),
  hasMore: z.boolean(),
  cursor: z.string().nullable(),
});
const DemandSignalExclusionOutput = z.object({
  type: z.enum(['category', 'adjacency', 'competitor', 'domain', 'keyword', 'raw']),
  values: z.array(z.string().min(1)).default([]),
  raw: z.string().optional(),
});
const DemandSignalFlexibilityOutput = z.object({
  mode: z.enum(['firm', 'flexible', 'open']),
  days: z.number().int().gte(0).lte(9007199254740991).optional(),
});
const DemandSignalKpiOutput = z.object({
  raw: z.string(),
  parsed: z
    .object({
      kpi: z.enum([
        'attention_seconds',
        'viewability_pct',
        'ctr',
        'vcr',
        'vtr',
        'reach',
        'frequency_cap',
        'sov',
        'brand_lift',
        'cpa',
      ]),
      op: z.enum(['gt', 'gte', 'eq', 'lte', 'lt']),
      value: z.number(),
    })
    .optional(),
});
const DemandSignalRecommendedProduct = z.object({
  productId: z.string(),
  name: z.string(),
  estimatedCpm: z.number().optional(),
  estimatedImpressions: z.number().int().gte(0).lte(9007199254740991).optional(),
  estimatedReach: z.number().int().gte(0).lte(9007199254740991).optional(),
  matchPct: z.number().gte(0).lte(100).optional(),
  rationale: z.string().optional(),
});
const DemandSignalResponseSummary = z.object({
  quotes: z.number().int().gte(0).lte(9007199254740991),
  clarifies: z.number().int().gte(0).lte(9007199254740991),
  declines: z.number().int().gte(0).lte(9007199254740991),
  books: z.number().int().gte(0).lte(9007199254740991),
});
const DemandSignal = z.object({
  id: z.string(),
  customerId: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  advertiserId: z.number().int().gte(-9007199254740991).lte(9007199254740991).nullable(),
  buyerName: z.string(),
  advertiserName: z.string(),
  campaignName: z.string().nullable(),
  audience: z.string(),
  geo: z.string(),
  channels: z.array(
    z.enum(['display', 'native', 'video', 'audio', 'ctv', 'dooh', 'newsletter', 'podcast'])
  ),
  exclusions: z.array(DemandSignalExclusionOutput),
  startDate: z.string(),
  endDate: z.string(),
  flexibility: DemandSignalFlexibilityOutput.nullable(),
  statedBudget: z.number(),
  currency: z.string(),
  primaryKpi: DemandSignalKpiOutput.nullable(),
  priceExpect: z.number().nullable(),
  creativeReady: z.boolean().nullable(),
  rawPrompt: z.string().nullable(),
  Status: z.enum(['SEARCHING', 'QUOTED', 'BOOKED', 'ABANDONED', 'DECLINED']),
  targetingMode: z.enum(['DIRECT', 'FILTERED', 'BROAD']),
  qualifiedBudget: z.number().nullable(),
  recommendedProducts: z.array(DemandSignalRecommendedProduct),
  createdAt: z.string(),
  updatedAt: z.string(),
  targetCount: z.number().int().gte(0).lte(9007199254740991).optional(),
  responseSummary: DemandSignalResponseSummary.optional(),
});
const DemandSignalList = z.object({
  items: z.array(DemandSignal),
  total: z.number().int().gte(0).lte(9007199254740991),
  hasMore: z.boolean(),
  nextOffset: z.number().int().gte(0).lte(9007199254740991).nullable(),
});
const DemandSignalExclusion = z
  .object({
    type: z.enum(['category', 'adjacency', 'competitor', 'domain', 'keyword', 'raw']),
    values: z.array(z.string().min(1)).optional().default([]),
    raw: z.string().optional(),
  })
  .passthrough();
const DemandSignalFlexibility = z
  .object({
    mode: z.enum(['firm', 'flexible', 'open']),
    days: z.number().int().gte(0).lte(9007199254740991).optional(),
  })
  .passthrough();
const DemandSignalKpi = z
  .object({
    raw: z.string(),
    parsed: z
      .object({
        kpi: z.enum([
          'attention_seconds',
          'viewability_pct',
          'ctr',
          'vcr',
          'vtr',
          'reach',
          'frequency_cap',
          'sov',
          'brand_lift',
          'cpa',
        ]),
        op: z.enum(['gt', 'gte', 'eq', 'lte', 'lt']),
        value: z.number(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();
const CreateDemandSignalTargetInput = z
  .object({
    storefrontId: z.number().int().lte(9007199254740991).optional(),
    externalPublisherName: z.string().min(1).optional(),
    externalPublisherDomain: z.string().min(1).optional(),
    bucket: z.enum(['LIVE', 'COMING_SOON', 'NOT_ON_INTERCHANGE']),
    matchPct: z.number().int().gte(0).lte(100).optional(),
  })
  .passthrough();
const CreateDemandSignalBody = z
  .object({
    advertiserId: z.number().int().lte(9007199254740991).optional(),
    buyerName: z.string().min(1).max(200),
    advertiserName: z.string().min(1).max(200),
    campaignName: z.string().min(1).max(200).optional(),
    audience: z.string().min(1).max(1000),
    geo: z.string().min(1).max(200),
    channels: z
      .array(
        z.enum(['display', 'native', 'video', 'audio', 'ctv', 'dooh', 'newsletter', 'podcast'])
      )
      .min(1),
    exclusions: z.array(DemandSignalExclusion).optional().default([]),
    startDate: z.string(),
    endDate: z.string(),
    flexibility: DemandSignalFlexibility.optional(),
    statedBudget: z.number().gt(0),
    currency: z.string().min(3).max(3),
    primaryKpi: DemandSignalKpi.optional(),
    priceExpect: z.number().gt(0).optional(),
    creativeReady: z.boolean().optional(),
    rawPrompt: z.string().max(4000).optional(),
    targetingMode: z.enum(['DIRECT', 'FILTERED', 'BROAD']).optional(),
    targets: z.array(CreateDemandSignalTargetInput).max(200).optional().default([]),
  })
  .passthrough();
const DemandSignalTarget = z.object({
  id: z.string(),
  demandSignalId: z.string(),
  storefrontId: z.string().nullable(),
  externalPublisherName: z.string().nullable(),
  externalPublisherDomain: z.string().nullable(),
  bucket: z.enum(['LIVE', 'COMING_SOON', 'NOT_ON_INTERCHANGE']),
  dispatchStatus: z.enum(['QUEUED', 'DISPATCHED', 'ACKNOWLEDGED', 'ON_HOLD', 'FAILED', 'DECLINED']),
  matchPct: z.number().int().gte(0).lte(100).nullable(),
  dispatchAttemptedAt: z.string().nullable(),
  dispatchedAt: z.string().nullable(),
  acknowledgedAt: z.string().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const DemandSignalWithTargets = z.object({
  id: z.string(),
  customerId: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  advertiserId: z.number().int().gte(-9007199254740991).lte(9007199254740991).nullable(),
  buyerName: z.string(),
  advertiserName: z.string(),
  campaignName: z.string().nullable(),
  audience: z.string(),
  geo: z.string(),
  channels: z.array(
    z.enum(['display', 'native', 'video', 'audio', 'ctv', 'dooh', 'newsletter', 'podcast'])
  ),
  exclusions: z.array(DemandSignalExclusionOutput),
  startDate: z.string(),
  endDate: z.string(),
  flexibility: DemandSignalFlexibilityOutput.nullable(),
  statedBudget: z.number(),
  currency: z.string(),
  primaryKpi: DemandSignalKpiOutput.nullable(),
  priceExpect: z.number().nullable(),
  creativeReady: z.boolean().nullable(),
  rawPrompt: z.string().nullable(),
  Status: z.enum(['SEARCHING', 'QUOTED', 'BOOKED', 'ABANDONED', 'DECLINED']),
  targetingMode: z.enum(['DIRECT', 'FILTERED', 'BROAD']),
  qualifiedBudget: z.number().nullable(),
  recommendedProducts: z.array(DemandSignalRecommendedProduct),
  createdAt: z.string(),
  updatedAt: z.string(),
  targetCount: z.number().int().gte(0).lte(9007199254740991).optional(),
  responseSummary: DemandSignalResponseSummary.optional(),
  targets: z.array(DemandSignalTarget),
});
const DemandSignalResponse = z.object({
  id: z.string(),
  demandSignalId: z.string(),
  demandSignalTargetId: z.string(),
  sellerCustomerId: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  storefrontId: z.string().nullable(),
  kind: z.enum(['QUOTE', 'CLARIFY', 'DECLINE', 'BOOK']),
  payload: z.object({}).partial().passthrough().nullable(),
  matchScore: z.number().int().gte(0).lte(100).nullable(),
  actorUserId: z.number().int().gte(-9007199254740991).lte(9007199254740991).nullable(),
  createdAt: z.string(),
  proposalCode: z.string().nullish(),
});
const DemandSignalResponseList = z.object({
  items: z.array(DemandSignalResponse),
  total: z.number().int().gte(0).lte(9007199254740991),
});
const McpInitializeRequest = z
  .object({
    jsonrpc: z.literal('2.0'),
    id: z.union([z.string(), z.number()]),
    method: z.literal('initialize'),
    params: z
      .object({
        protocolVersion: z.string(),
        capabilities: z.object({}).partial().passthrough(),
        clientInfo: z.object({ name: z.string(), version: z.string() }).passthrough(),
      })
      .passthrough(),
  })
  .passthrough();
const McpInitializeResponse = z
  .object({
    jsonrpc: z.literal('2.0'),
    id: z.union([z.string(), z.number()]),
    result: z
      .object({
        protocolVersion: z.string(),
        capabilities: z.object({}).partial().passthrough(),
        serverInfo: z.object({ name: z.string(), version: z.string() }).partial().passthrough(),
      })
      .partial()
      .passthrough(),
  })
  .partial()
  .passthrough();
const McpApiCallRequest = z
  .object({
    jsonrpc: z.literal('2.0'),
    id: z.union([z.string(), z.number()]),
    method: z.literal('tools/call'),
    params: z
      .object({
        name: z.literal('api_call'),
        arguments: z
          .object({
            method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
            path: z.string(),
            body: z.object({}).partial().passthrough().optional(),
            query: z.object({}).partial().passthrough().optional(),
          })
          .passthrough(),
      })
      .passthrough(),
  })
  .passthrough();
const McpToolResponse = z
  .object({
    jsonrpc: z.literal('2.0'),
    id: z.union([z.string(), z.number()]),
    result: z
      .object({
        content: z.array(
          z
            .object({ type: z.literal('text'), text: z.string() })
            .partial()
            .passthrough()
        ),
      })
      .partial()
      .passthrough(),
  })
  .partial()
  .passthrough();
const McpAskCapabilityRequest = z
  .object({
    jsonrpc: z.literal('2.0'),
    id: z.union([z.string(), z.number()]),
    method: z.literal('tools/call'),
    params: z
      .object({
        name: z.literal('ask_about_capability'),
        arguments: z.object({ question: z.string() }).passthrough(),
      })
      .passthrough(),
  })
  .passthrough();

export const schemas: Record<string, z.ZodTypeAny> = {
  AdvertiserSummary,
  AdvertiserListResponse,
  ApiError,
  ErrorResponse,
  LinkedAccountInput,
  OptimizationApplyMode,
  CampaignBudgetType,
  GcsCredentialConfig,
  S3CredentialConfig,
  AzureBlobSasAuthInput,
  AzureBlobAuthInput,
  AzureBlobCredentialConfigInput,
  CredentialConfigInput,
  DataDeliveryCredentialInput,
  DataDeliveryCredentialArrayInput,
  GcsDeliveryConfig,
  S3DeliveryConfig,
  AzureBlobDeliveryConfig,
  DeliveryConfig,
  DataDeliveryOutputInput,
  DataDeliveryOutputArrayInput,
  AdvertiserDataDeliveryInput,
  CreateAdvertiserBody,
  BrandManifestJson,
  BuyerCredentialSourceRef,
  LinkedAccount,
  GcsCredentialConfigOutput,
  S3CredentialConfigOutput,
  AzureBlobSasAuthStored,
  AzureBlobAuthStored,
  AzureBlobCredentialConfig,
  CredentialConfig,
  DataDeliveryCredential,
  GcsDeliveryConfigOutput,
  S3DeliveryConfigOutput,
  AzureBlobDeliveryConfigOutput,
  DeliveryConfigOutput,
  DataDeliveryOutput,
  AdvertiserDataDelivery,
  FrequencyCapTargetLevel,
  Advertiser,
  UpdateAdvertiserBody,
  RevalidateDataDeliveryCredentialResponse,
  DiscoveryRefinementItem,
  DiscoverProductsBody,

  ProductCardData,
  PricingOptionData,
  Product,
  ProductGroup,
  DiscoverySummary,
  BudgetContextResponse,
  ProductAllocation,
  Proposal,
  AgentDebugLog,
  AgentDiscoveryResult,
  RefinementApplied,
  DiscoverProductsResponse,
  StorefrontIds,
  StorefrontNames,
  Debug,
  SelectedProduct,
  SessionProductsResponse,
  ProductSelection,
  AddProductsRequest,
  RemoveProductsRequest,
  ApplyProposalRequest,
  AppliedProposalSummary,
  ApplyProposalResponse,
  Status,
  MediaBuyStatus,
  CampaignType,
  CampaignSummary,
  CampaignListResponse,
  Duration,
  OptimizationAttributionWindow,
  EventGoal,
  MetricGoal,
  OptimizationGoal,
  PerformanceConfig,
  PacingPeriods,
  CampaignUtmConfig,
  CampaignDataDeliveryInput,
  CreateCampaignBody,
  MediaBuyRef,
  MediaBudget,
  CampaignFeePricingType,
  CampaignFeeUnit,
  CampaignFee,
  CampaignFees,
  PacingPeriodsOutput,
  CampaignStorefrontRef,
  DurationOutput,
  OptimizationAttributionWindowOutput,
  EventGoalOutput,
  MetricGoalOutput,
  OptimizationGoalOutput,
  PerformanceConfigOutput,
  CampaignDataDelivery,
  Campaign,
  CampaignResponse,
  UpdateCampaignBody,
  MediaBuyId,
  IncludePropertyLists,
  ExecuteCampaignBody,
  ExecuteMediaBuyDebugInfo,
  ExecutionError,
  CampaignStatusChangeResponse,
  RefinementItem,
  AutoSelectProductsRequest,
  AutoSelectProductsResponse,
  GetAdcpStatusOutput,
  CampaignProductEntry,
  CampaignSearchContextSummary,
  CampaignProductsResponse,
  ResourceTypes,
  BuyerAuditLog,
  ListBuyerActivityResponse,
  UrlAssetSlotInput,
  TextAssetSlotInput,
  CardInput,
  CreateCreativeManifestMetadata,
  ManifestAssetResponse,
  CreativeManifestSyncStatus,
  CreativeManifestResponse,
  CreativeManifest,
  ValidateCreativeBody,
  ValidationResult,
  ValidateCreativeResponse,
  CreativeManifestSummary,
  CreativeManifestListResponse,
  UpdateCreativeManifestMetadata,
  EventSourceOutput,
  EventSourceListResponse,
  SyncEventSourceObject,
  SyncEventSourcesRequest,
  EventSourceSyncResult,
  SyncEventSourcesResponse,
  EventSummaryType,
  EventType,
  EventSummaryEntry,
  EventSummaryResponse,
  UserMatch,
  ContentItem,
  CustomData,
  LogEventObject,
  LogEventRequest,
  LogEventPartialFailure,
  LogEventResponse,
  SyncMeasurementObject,
  SyncMeasurementDataRequest,
  MeasurementDataSyncResult,
  SyncMeasurementDataResponse,
  TestCohortSummary,
  TestCohortListResponse,
  CohortDefinition,
  CreateTestCohortInput,
  TestCohortOutput,
  TestCohortResponse,
  UpdateTestCohortInput,
  MmmConfig,
  MeasurementConfigOutput,
  MeasurementConfigResponse,
  UpdateMeasurementConfigInput,
  CreateMeasurementSourceBody,
  UpdateMeasurementSourceBody,
  UploadMeasurementRecordsBody,
  UploadContextRecordsBody,
  ReportingMetrics,
  PackageReporting,
  MediaBuyReporting,
  CampaignReporting,
  AdvertiserReporting,
  ReportingMetricsResponse,
  CurrentAccountResponse,
  OrgAccountSummary,
  ListCustomerAccountsResponse,
  CreateChildAccountBody,
  CreateChildAccountResponse,
  UpdateCustomerDomainBody,
  UpdateCustomerDomainResponse,
  MembershipSettingsResponse,
  UpdateMembershipSettingsBody,
  UpdateNotificationPreferencesBody,
  CheckModerationBody,
  AvailableAccountOutput,
  AvailableAccountListResponse,
  ReportingBucket,
  UpdateReportingBucketBody,
  AccountOutput,
  AccountResponse,
  SyncCatalogsBody,
  BuyerStorefrontSummary,
  BuyerStorefrontList,
  BuyerStorefrontSource,
  BuyerStorefront,
  BuyerCredential,
  RegisterSourceCredentialsBody,
  BuyerCredentialOAuthInfo,
  BuyerCredentialRegistrationResponse,
  SyndicateBody,
  SyndicationStatusOutput,
  SyndicateResponse,
  SyndicationStatusListResponse,
  RemoveMember,
  AudienceItem,
  SyncAudiencesBody,
  SyncAudiencesResponse,
  AudienceSummary,
  AudienceListResponse,
  TaskError,
  TaskOutput,
  TaskResponse,
  PropertyListSummary,
  PropertyListListResponse,
  PropertyListFilters,
  CreatePropertyListInput,
  PropertyListResolutionSummary,
  PropertyListCascadeSummary,
  PropertyListFiltersOutput,
  PropertyListOutput,
  PropertyListResponse,
  UpdatePropertyListInput,
  EmptyResponse,
  CheckPropertyListBody,
  BuyerInvoiceItem,
  BuyerInvoicesResponse,
  BuyerPendingInvoiceItem,
  BuyerPendingInvoiceItemsResponse,
  DemandSignalExclusionOutput,
  DemandSignalFlexibilityOutput,
  DemandSignalKpiOutput,
  DemandSignalRecommendedProduct,
  DemandSignalResponseSummary,
  DemandSignal,
  DemandSignalList,
  DemandSignalExclusion,
  DemandSignalFlexibility,
  DemandSignalKpi,
  CreateDemandSignalTargetInput,
  CreateDemandSignalBody,
  DemandSignalTarget,
  DemandSignalWithTargets,
  DemandSignalResponse,
  DemandSignalResponseList,
  McpInitializeRequest,
  McpInitializeResponse,
  McpApiCallRequest,
  McpToolResponse,
  McpAskCapabilityRequest,
};
