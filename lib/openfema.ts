const DETAILS_ENDPOINT =
  "https://www.fema.gov/api/open/v2/PublicAssistanceFundedProjectsDetails";

export function openFemaProjectUrl(gmProjectId: string | number | null): string | null {
  if (gmProjectId == null || gmProjectId === "") return null;
  return `${DETAILS_ENDPOINT}?$filter=gmProjectId eq ${gmProjectId}`;
}

export const OPENFEMA_DATASET_PAGE =
  "https://www.fema.gov/openfema-data-page/public-assistance-funded-projects-details-v2";
