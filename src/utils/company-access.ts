type NullableRecord = Record<string, any> | null | undefined;

function normalizeAccessCodeList(items: any[], candidateKeys: string[]) {
  if (!Array.isArray(items)) return [] as string[];

  return Array.from(
    new Set(
      items
        .map((item) => {
          if (!item || typeof item !== 'object') return '';
          for (const key of candidateKeys) {
            const value = String(item[key] || '').trim();
            if (value) return value;
          }
          return '';
        })
        .filter(Boolean)
    )
  );
}

export function getCompanyMenuCodeList(currentCompany: NullableRecord) {
  return normalizeAccessCodeList(currentCompany?.menus || [], ['menu_code', 'code', 'value']);
}

export function getCompanyFeatureCodeList(currentCompany: NullableRecord) {
  return normalizeAccessCodeList(currentCompany?.features || [], ['code', 'feature_code', 'value']);
}

export function hasCompanyMenuAccess(currentCompany: NullableRecord, accesses?: string[]) {
  if (!accesses || !accesses.length) return true;
  if (!Array.isArray(currentCompany?.menus)) return true;
  const menuCodes = getCompanyMenuCodeList(currentCompany);
  return accesses.some((access) => menuCodes.includes(access));
}

export function hasCompanyFeatureAccess(currentCompany: NullableRecord, accesses?: string[]) {
  if (!accesses || !accesses.length) return true;
  if (!Array.isArray(currentCompany?.features)) return true;
  const featureCodes = getCompanyFeatureCodeList(currentCompany);
  return accesses.some((access) => featureCodes.includes(access));
}
