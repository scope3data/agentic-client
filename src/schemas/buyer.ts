/* eslint-disable */
// Auto-generated from OpenAPI spec - DO NOT EDIT

import { z } from 'zod';

const Error = z.object({ error: z.string(), message: z.string().optional() });
const LinkedAccountInput = z
  .object({
    partnerId: z.string().min(1),
    accountId: z.string().min(1),
    billingType: z.string().optional(),
  })
  .passthrough();
const OptimizationApplyMode = z.enum(['AUTO', 'MANUAL']);
const CreateAdvertiserBody = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    brand: z.string().min(1),
    saveBrand: z.boolean().optional().default(false),
    linkedAccounts: z.array(LinkedAccountInput).optional(),
    optimizationApplyMode: OptimizationApplyMode.optional(),
    sandbox: z.boolean().optional().default(false),
  })
  .passthrough();
const UpdateAdvertiserBody = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000),
    brand: z.string().min(1),
    linkedAccounts: z.array(LinkedAccountInput),
    optimizationApplyMode: OptimizationApplyMode,
  })
  .partial()
  .passthrough();
const DiscoverProductsBody = z
  .object({
    advertiserId: z.number().int().lte(9007199254740991),
    discoveryId: z.string().optional(),
    campaignId: z.string().optional(),
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
    salesAgentIds: z.array(z.string().max(255)).max(50).optional(),
    salesAgentNames: z.array(z.string().max(255)).max(50).optional(),
    groupLimit: z.number().int().lte(10).optional().default(10),
    groupOffset: z.number().int().gte(0).lte(9007199254740991).optional().default(0),
    productsPerGroup: z.number().int().lte(15).optional().default(10),
    productOffset: z.number().int().gte(0).lte(1000).optional().default(0),
  })
  .passthrough();
const discoverProducts_Body = DiscoverProductsBody;
const ProductCardData = z.object({
  format_id: z.object({ agent_url: z.string(), id: z.string() }),
  manifest: z.object({}).partial().passthrough(),
});
const PricingOptionData = z
  .object({
    pricing_option_id: z.string(),
    pricing_model: z.string(),
    is_fixed: z.boolean(),
    rate: z.number(),
    floor_price: z.number(),
    fixed_price: z.number(),
    currency: z.string(),
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
  description: z.string().optional(),
  deliveryType: z.enum(['guaranteed', 'non_guaranteed']).optional(),
  briefRelevance: z.string().optional(),
  productCard: ProductCardData.optional(),
  productCardDetailed: ProductCardData.optional(),
  pricingOptions: z.array(PricingOptionData).optional(),
  estimatedExposures: z.number().int().gte(-9007199254740991).lte(9007199254740991).optional(),
  forecast: z.object({}).partial().passthrough().optional(),
  publisherProperties: z
    .array(
      z
        .object({
          publisher_domain: z.string(),
          property_type: z.string(),
          name: z.string(),
          selection_type: z.string(),
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
  allocations: z.array(ProductAllocation).min(1),
  expiresAt: z.string().optional(),
  totalBudgetGuidance: z
    .object({ min: z.number(), recommended: z.number(), max: z.number(), currency: z.string() })
    .partial()
    .optional(),
});
const DiscoverProductsResponse = z.object({
  discoveryId: z.string(),
  productGroups: z.array(ProductGroup),
  totalGroups: z.number().int().gte(0).lte(9007199254740991),
  hasMoreGroups: z.boolean(),
  summary: DiscoverySummary,
  budgetContext: BudgetContextResponse.optional(),
  proposals: z.array(Proposal).optional(),
});
const salesAgentIds = z.union([z.array(z.string().max(255)), z.string()]).optional();
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
    bid_price: z.number().optional(),
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
const DurationOutput = z.object({
  interval: z.number().int().lte(9007199254740991),
  unit: z.enum(['minutes', 'hours', 'days', 'campaign']),
});
const OptimizationAttributionWindowOutput = z.object({
  post_click: DurationOutput,
  post_view: DurationOutput.optional(),
});
const EventGoalOutput = z.object({
  kind: z.literal('event'),
  eventSources: z
    .array(
      z.object({
        eventSourceId: z.string().min(1),
        eventType: z.enum([
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
const Campaign = z.object({
  campaignId: z.string(),
  advertiserId: z.string(),
  name: z.string(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
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
  constraints: z
    .object({
      channels: z.array(z.string()),
      countries: z.array(z.string().regex(/^[A-Z]{2}$/)).max(250),
    })
    .partial()
    .optional(),
  performanceConfig: PerformanceConfigOutput.optional(),
  optimizationApplyMode: OptimizationApplyMode,
  productCount: z.number().int().gte(0).lte(9007199254740991).optional(),
  audiences: z
    .array(
      z.object({
        audienceId: z.string(),
        name: z.string().nullable(),
        status: z.enum(['PROCESSING', 'ERROR', 'READY', 'TOO_SMALL']),
        type: z.enum(['TARGET', 'SUPPRESS']),
        enabledAt: z.string().datetime({ offset: true }),
      })
    )
    .optional(),
  mediaBuys: z
    .array(
      z.object({
        mediaBuyId: z.string(),
        name: z.string(),
        status: z.string(),
        products: z
          .array(
            z.object({
              productId: z.string(),
              salesAgentName: z.string().optional(),
              budget: z.number().optional(),
              budgetCurrency: z.string().optional(),
            })
          )
          .optional(),
        packages: z
          .array(
            z.object({
              packageId: z.string(),
              status: z.string(),
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
        createdAt: z.string().datetime({ offset: true }),
        updatedAt: z.string().datetime({ offset: true }),
      })
    )
    .optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
const CampaignListResponse = z.object({
  campaigns: z.array(Campaign),
  total: z.number().int().gte(0).lte(9007199254740991),
});
const Duration = z
  .object({
    interval: z.number().int().lte(9007199254740991),
    unit: z.enum(['minutes', 'hours', 'days', 'campaign']),
  })
  .passthrough();
const OptimizationAttributionWindow = z
  .object({ post_click: Duration, post_view: Duration.optional() })
  .passthrough();
const EventGoal = z
  .object({
    kind: z.literal('event'),
    eventSources: z
      .array(
        z
          .object({
            eventSourceId: z.string().min(1),
            eventType: z.enum([
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
        currency: z.string().min(3).max(3).optional().default('USD'),
        dailyCap: z.number().gt(0).optional(),
        pacing: z.enum(['EVEN', 'ASAP', 'FRONTLOADED']).optional(),
      })
      .passthrough(),
    brief: z.string().max(5000).optional(),
    constraints: z
      .object({
        channels: z.array(z.string()),
        countries: z.array(z.string().regex(/^[A-Z]{2}$/)).max(250),
      })
      .partial()
      .passthrough()
      .optional(),
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
  })
  .passthrough();
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
        channels: z.array(z.string()),
        countries: z.array(z.string().regex(/^[A-Z]{2}$/)).max(250),
      })
      .partial()
      .passthrough(),
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
  })
  .partial()
  .passthrough();
const ExecuteCampaignBody = z.object({ debug: z.boolean() }).partial().passthrough();
const ExecuteMediaBuyDebugInfo = z
  .object({
    request: z.object({}).partial().passthrough(),
    response: z.object({}).partial().passthrough(),
    debugLogs: z.array(z.object({}).partial().passthrough()),
    error: z.string(),
  })
  .partial();
const ExecutionError = z.object({
  mediaBuyId: z.string(),
  salesAgentId: z.string(),
  message: z.string(),
  debug: ExecuteMediaBuyDebugInfo.optional(),
});
const CampaignStatusChangeResponse = z.object({
  campaignId: z.string(),
  previousStatus: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
  newStatus: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
  success: z.boolean(),
  errors: z.array(ExecutionError).optional(),
});
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
const CreateEventSourceInput = z
  .object({
    eventSourceId: z.string().min(1).max(255),
    name: z.string().min(1).max(255),
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
      .min(1)
      .optional(),
    allowedDomains: z.array(z.string().min(1)).optional(),
  })
  .passthrough();
const EventSourceResponse = z.object({ eventSource: EventSourceOutput });
const UpdateEventSourceInput = z
  .object({
    name: z.string().min(1).max(255),
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
      .min(1),
    allowedDomains: z.array(z.string().min(1)),
  })
  .partial()
  .passthrough();
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
const PackageReporting = z.object({ packageId: z.string(), metrics: ReportingMetrics });
const MediaBuyReporting = z.object({
  mediaBuyId: z.string(),
  name: z.string(),
  status: z.string(),
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
const AvailableAccountOutput = z.object({
  accountId: z.string(),
  name: z.string().nullish(),
  advertiser: z.string().nullish(),
  billingProxy: z.string().nullish(),
  house: z.string().nullish(),
  billing: z.string().nullish(),
  partnerId: z.string(),
  partnerName: z.string(),
  status: z.enum(['active', 'pending_approval', 'payment_required', 'suspended', 'closed']),
});
const AvailableAccountListResponse = z.object({
  accounts: z.array(AvailableAccountOutput),
  total: z.number().int().gte(0).lte(9007199254740991),
  synced: z.boolean().optional(),
  billingOptions: z
    .object({ default: z.string().nullable(), supported: z.array(z.string()) })
    .optional(),
});
const syncCatalogs_Body = z
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
            items: z.array(z.object({}).partial().passthrough()).optional(),
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
const CustomerAccountSummary = z.object({ accountIdentifier: z.string(), status: z.string() });
const OAuthInfo = z.object({
  authorizationUrl: z.string().url(),
  agentId: z.string(),
  agentName: z.string(),
});
const Agent = z.object({
  agentId: z.string(),
  type: z.enum(['SALES', 'SIGNAL', 'CREATIVE', 'OUTCOME']),
  name: z.string(),
  description: z.string().nullish(),
  endpointUrl: z.string(),
  protocol: z.enum(['MCP', 'A2A']),
  authenticationType: z.enum(['API_KEY', 'NO_AUTH', 'JWT', 'OAUTH']),
  requiresOperatorAuth: z.boolean(),
  billingOptions: z
    .object({ default: z.string().nullable(), supported: z.array(z.string()) })
    .nullish(),
  status: z.enum(['PENDING', 'ACTIVE', 'DISABLED', 'COMING_SOON']),
  relationship: z.enum(['SELF', 'MARKETPLACE']),
  customerAccounts: z.array(CustomerAccountSummary).optional(),
  requiresAccount: z.boolean(),
  authConfigured: z.boolean(),
  capabilities: z
    .object({
      version: z.enum(['v2', 'v3']),
      protocols: z.array(z.string()),
      extensions: z.array(z.string()),
      features: z
        .object({
          inlineCreativeManagement: z.boolean(),
          propertyListFiltering: z.boolean(),
          contentStandards: z.boolean(),
          conversionTracking: z.boolean(),
          audienceManagement: z.boolean(),
        })
        .partial(),
      sandbox: z.boolean(),
      publisherDomains: z.array(z.string()).optional(),
      channels: z.array(z.string()).optional(),
      lastUpdated: z.string().optional(),
      accounts: z.object({
        requireOperatorAuth: z.boolean(),
        defaultBilling: z.string().nullable(),
        supportedBillings: z.array(z.string()),
      }),
    })
    .nullish(),
  createdAt: z.string().datetime({ offset: true }),
  oauth: OAuthInfo.nullish(),
});
const AgentList = z.object({
  items: z.array(Agent),
  total: z.number().int().gte(0).lte(9007199254740991),
  hasMore: z.boolean(),
});
const registerSalesAgentAccount_Body = z
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
const AgentAccount = z.object({
  id: z.string(),
  accountIdentifier: z.string(),
  status: z.string(),
  registeredBy: z.string(),
  createdAt: z.string().datetime({ offset: true }),
  oauth: OAuthInfo.optional(),
});
const syndicate_Body = z
  .object({
    resource_type: z.enum(['AUDIENCE', 'EVENT_SOURCE', 'CATALOG']),
    resource_id: z.string().min(1),
    adcp_agent_ids: z.array(z.string().min(1)).min(1),
    enabled: z.boolean(),
  })
  .passthrough();
const SyndicationStatusOutput = z.object({
  id: z.string(),
  customer_id: z.number().int().gte(-9007199254740991).lte(9007199254740991),
  seat_id: z.string(),
  resource_type: z.enum(['AUDIENCE', 'EVENT_SOURCE', 'CATALOG']),
  resource_id: z.string(),
  audience_id: z.string().nullable(),
  event_source_id: z.string().nullable(),
  catalog_id: z.string().nullable(),
  adcp_agent_id: z.string(),
  adcp_agent_account_id: z.string().nullable(),
  enabled: z.boolean(),
  status: z.enum(['PENDING', 'SYNCING', 'COMPLETED', 'FAILED', 'DISABLED']),
  error_message: z.string().nullable(),
  response_data: z.unknown().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().nullable(),
});
const SyndicateResponse = z.object({ data: z.array(SyndicationStatusOutput) });
const SyndicationStatusListResponse = z.object({
  items: z.array(SyndicationStatusOutput),
  total: z.number().int().gte(0).lte(9007199254740991),
});
const RemoveMember = z.object({ externalId: z.string().min(1) }).passthrough();
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
      .max(10000)
      .optional(),
    remove: z.array(RemoveMember).max(10000).optional(),
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
        token: z.string().nullish(),
        authentication: z
          .object({
            schemes: z.union([
              z.array(z.unknown()),
              z.array(z.union([z.literal('Bearer'), z.literal('HMAC-SHA256')])),
            ]),
            credentials: z.string(),
          })
          .passthrough(),
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
const Audience = z.object({
  audienceId: z.string(),
  name: z.string().nullable(),
  accountId: z.string(),
  consentBasis: z
    .enum(['consent', 'legitimate_interest', 'contract', 'legal_obligation'])
    .nullable(),
  status: z.enum(['PROCESSING', 'ERROR', 'READY', 'TOO_SMALL']),
  deleted: z.boolean(),
  uploadedCount: z.number().nullable(),
  matchedCount: z.number().nullable(),
  lastOperationStatus: z.enum(['PROCESSING', 'COMPLETED', 'ERROR']).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const AudienceListResponse = z.object({
  audiences: z.array(Audience),
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
  status: z.enum(['submitted', 'working', 'completed', 'failed', 'input-required']),
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

export const schemas = {
  Error,
  LinkedAccountInput,
  OptimizationApplyMode,
  CreateAdvertiserBody,
  UpdateAdvertiserBody,
  DiscoverProductsBody,
  discoverProducts_Body,
  ProductCardData,
  PricingOptionData,
  Product,
  ProductGroup,
  DiscoverySummary,
  BudgetContextResponse,
  ProductAllocation,
  Proposal,
  DiscoverProductsResponse,
  salesAgentIds,
  SelectedProduct,
  SessionProductsResponse,
  ProductSelection,
  AddProductsRequest,
  RemoveProductsRequest,
  ApplyProposalRequest,
  AppliedProposalSummary,
  ApplyProposalResponse,
  DurationOutput,
  OptimizationAttributionWindowOutput,
  EventGoalOutput,
  MetricGoalOutput,
  OptimizationGoalOutput,
  PerformanceConfigOutput,
  Campaign,
  CampaignListResponse,
  Duration,
  OptimizationAttributionWindow,
  EventGoal,
  MetricGoal,
  OptimizationGoal,
  PerformanceConfig,
  CreateCampaignBody,
  CampaignResponse,
  UpdateCampaignBody,
  ExecuteCampaignBody,
  ExecuteMediaBuyDebugInfo,
  ExecutionError,
  CampaignStatusChangeResponse,
  EventSourceOutput,
  EventSourceListResponse,
  CreateEventSourceInput,
  EventSourceResponse,
  UpdateEventSourceInput,
  SyncEventSourceObject,
  SyncEventSourcesRequest,
  EventSourceSyncResult,
  SyncEventSourcesResponse,
  ReportingMetrics,
  PackageReporting,
  MediaBuyReporting,
  CampaignReporting,
  AdvertiserReporting,
  ReportingMetricsResponse,
  AvailableAccountOutput,
  AvailableAccountListResponse,
  syncCatalogs_Body,
  CustomerAccountSummary,
  OAuthInfo,
  Agent,
  AgentList,
  registerSalesAgentAccount_Body,
  AgentAccount,
  syndicate_Body,
  SyndicationStatusOutput,
  SyndicateResponse,
  SyndicationStatusListResponse,
  RemoveMember,
  AudienceItem,
  SyncAudiencesBody,
  SyncAudiencesResponse,
  Audience,
  AudienceListResponse,
  TaskError,
  TaskOutput,
  TaskResponse,
  McpInitializeRequest,
  McpInitializeResponse,
  McpApiCallRequest,
  McpToolResponse,
  McpAskCapabilityRequest,
};
