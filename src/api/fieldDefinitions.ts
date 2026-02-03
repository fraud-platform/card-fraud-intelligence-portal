/**
 * Field Definitions API Client
 *
 * API functions for field registry and field definition management.
 * Supports versioning, approval workflow, and registry publishing.
 */

import { dataProvider } from "../app/dataProvider";
import { FIELD_REGISTRY } from "./endpoints";
import type {
  CreateFieldDefinitionRequest,
  CreateFieldVersionRequest,
  FieldDefinition,
  FieldRegistryDetail,
  FieldRegistryManifest,
  FieldVersion,
  FieldVersionDecisionRequest,
  NextFieldIdResponse,
  SubmitFieldVersionRequest,
} from "../types/fieldDefinitions";
import type { KeysetPaginatedResponse } from "./types";

// ============================================================================
// Field Definitions API
// ============================================================================

/**
 * Get list of field definitions with optional filtering
 */
export async function getFieldDefinitions(filters?: {
  is_active?: boolean;
  data_type?: string;
  search?: string;
}): Promise<FieldDefinition[]> {
  const hasFilters = filters !== undefined && Object.keys(filters).length > 0;
  let query = "";
  if (hasFilters) {
    const entries = Object.entries(filters as Record<string, unknown>);
    query = new URLSearchParams(
      entries.filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString();
  }

  const url = query !== "" ? `/rule-fields?${query}` : "/rule-fields";
  const response = await dataProvider.custom?.({
    url,
    method: "get",
  });

  const responseData = response?.data as
    | { data?: FieldDefinition[] }
    | FieldDefinition[]
    | undefined;
  if (Array.isArray(responseData)) {
    return responseData;
  }
  return responseData?.data ?? [];
}

/**
 * Get a single field definition by field key
 */
export async function getFieldDefinition(fieldKey: string): Promise<FieldDefinition> {
  const response = await dataProvider.getOne<FieldDefinition>({
    resource: "rule-fields",
    id: fieldKey,
  });
  return response.data;
}

/**
 * Create a new field definition
 */
export async function createFieldDefinition(
  data: CreateFieldDefinitionRequest
): Promise<FieldDefinition> {
  const response = await dataProvider.create<FieldDefinition>({
    resource: "rule-fields",
    variables: data,
  });
  return response.data;
}

/**
 * Update an existing field definition (creates new version via version endpoint)
 */
export async function updateFieldDefinition(
  fieldKey: string,
  data: CreateFieldVersionRequest
): Promise<FieldVersion> {
  const response = await dataProvider.custom?.<FieldVersion>({
    url: `/rule-fields/${fieldKey}/versions`,
    method: "post",
    payload: data,
  });
  return response?.data as FieldVersion;
}

/**
 * Delete a field definition
 */
export async function deleteFieldDefinition(fieldKey: string): Promise<void> {
  await dataProvider.deleteOne({
    resource: "rule-fields",
    id: fieldKey,
  });
}

// ============================================================================
// Field Versions API
// ============================================================================

/**
 * Get all versions of a field definition
 */
export async function getFieldVersions(fieldKey: string): Promise<FieldVersion[]> {
  const response = await dataProvider.custom?.<FieldVersion[]>({
    url: `/rule-fields/${fieldKey}/versions`,
    method: "get",
  });
  const responseData = response?.data as { data?: FieldVersion[] } | FieldVersion[] | undefined;
  if (Array.isArray(responseData)) {
    return responseData;
  }
  return responseData?.data ?? [];
}

/**
 * Get a specific field version
 */
export async function getFieldVersion(versionId: string): Promise<FieldVersion> {
  const response = await dataProvider.getOne<FieldVersion>({
    resource: "rule-field-versions",
    id: versionId,
  });
  return response.data;
}

/**
 * Submit a field version for approval
 */
export async function submitFieldVersion(
  versionId: string,
  request?: SubmitFieldVersionRequest
): Promise<FieldVersion> {
  const response = await dataProvider.custom?.<FieldVersion>({
    url: `/rule-field-versions/${versionId}/submit`,
    method: "post",
    payload: request ?? {},
  });
  return response?.data as FieldVersion;
}

/**
 * Approve or reject a field version
 */
export async function decideFieldVersion(
  versionId: string,
  request: FieldVersionDecisionRequest
): Promise<FieldVersion> {
  const action = request.decision.toLowerCase();
  const response = await dataProvider.custom?.<FieldVersion>({
    url: `/rule-field-versions/${versionId}/${action}`,
    method: "post",
    payload: { remarks: request.remarks },
  });
  return response?.data as FieldVersion;
}

// ============================================================================
// Field Registry API
// ============================================================================

/**
 * Get the current (active) field registry manifest
 */
export async function getFieldRegistry(): Promise<FieldRegistryManifest> {
  const response = await dataProvider.custom?.<FieldRegistryManifest>({
    url: FIELD_REGISTRY.GET,
    method: "get",
  });
  return response?.data as FieldRegistryManifest;
}

/**
 * Get all field registry versions
 */
export async function getFieldRegistryVersions(): Promise<FieldRegistryManifest[]> {
  const response = await dataProvider.custom?.<KeysetPaginatedResponse<FieldRegistryManifest>>({
    url: FIELD_REGISTRY.VERSIONS,
    method: "get",
  });
  const responseData = response?.data as
    | { items?: FieldRegistryManifest[] }
    | FieldRegistryManifest[]
    | undefined;
  if (Array.isArray(responseData)) {
    return responseData;
  }
  return responseData?.items ?? [];
}

/**
 * Get a specific field registry version with details
 */
export async function getFieldRegistryVersion(
  registryVersion: number
): Promise<FieldRegistryDetail> {
  const response = await dataProvider.custom?.<FieldRegistryDetail>({
    url: FIELD_REGISTRY.GET_VERSION(registryVersion),
    method: "get",
  });
  return response?.data as FieldRegistryDetail;
}

/**
 * Get all fields in a specific registry version
 */
export async function getFieldRegistryVersionFields(
  registryVersion: number
): Promise<FieldDefinition[]> {
  const response = await dataProvider.custom?.<FieldDefinition[]>({
    url: FIELD_REGISTRY.GET_VERSION_FIELDS(registryVersion),
    method: "get",
  });
  const responseData = response?.data as
    | { data?: FieldDefinition[] }
    | FieldDefinition[]
    | undefined;
  if (Array.isArray(responseData)) {
    return responseData;
  }
  return responseData?.data ?? [];
}

/**
 * Get the next available field ID for creating new fields
 */
export async function getNextFieldId(): Promise<NextFieldIdResponse> {
  const response = await dataProvider.custom?.<NextFieldIdResponse>({
    url: FIELD_REGISTRY.NEXT_FIELD_ID,
    method: "get",
  });
  return response?.data as NextFieldIdResponse;
}

/**
 * Publish a new field registry version from approved field versions
 */
export async function publishFieldRegistry(): Promise<FieldRegistryManifest> {
  const response = await dataProvider.custom?.<FieldRegistryManifest>({
    url: FIELD_REGISTRY.PUBLISH,
    method: "post",
  });
  return response?.data as FieldRegistryManifest;
}

// ============================================================================
// Consolidated API Object
// ============================================================================

export const fieldDefinitionsApi = {
  // Field definitions
  getList: getFieldDefinitions,
  getOne: getFieldDefinition,
  create: createFieldDefinition,
  update: updateFieldDefinition,
  delete: deleteFieldDefinition,

  // Field versions
  getVersions: getFieldVersions,
  getVersion: getFieldVersion,
  submitVersion: submitFieldVersion,
  decideVersion: decideFieldVersion,

  // Field registry
  getRegistry: getFieldRegistry,
  getRegistryVersions: getFieldRegistryVersions,
  getRegistryVersion: getFieldRegistryVersion,
  getRegistryVersionFields: getFieldRegistryVersionFields,
  getNextFieldId,
  publishRegistry: publishFieldRegistry,
} as const;

export default fieldDefinitionsApi;
