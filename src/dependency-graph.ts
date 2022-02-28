export type DependencyGraphCompareResponse = {
  change_type: 'added' | 'removed'
  manifest: string
  ecosystem: string
  name: string
  version: string
  package_url: string
  license: string
  repository_nwo: string
  vulnerabilities?: {
    severity: string
    advisory_ghsa_id: string
    advisory_summary: string
    advisory_description: string
  }[]
}[]

export async function compare(
  _baseRef: string,
  _headRef: string
): Promise<DependencyGraphCompareResponse> {
  // todo: actually do an API call here!
  return [
    {
      change_type: 'removed',
      manifest: 'path/to/package-lock.json',
      ecosystem: 'npm',
      name: '@actions/core',
      version: '1.1.0',
      package_url: 'pkg:/npm/%40actions/core@1.1.0',
      license: 'MIT',
      repository_nwo: 'owner/sourcerepo'
    },
    {
      change_type: 'added',
      manifest: 'path/to/package-lock.json',
      ecosystem: 'npm',
      name: '@actions/core',
      version: '1.2.2',
      package_url: 'pkg:/npm/%40actions/core@1.2.2',
      license: 'MIT',
      repository_nwo: 'owner/sourcerepo',
      vulnerabilities: [
        {
          severity: 'critical',
          advisory_ghsa_id: 'GHSA-rf4j-j272-fj86',
          advisory_summary: 'lorem ipsum hackum',
          advisory_description:
            'tall dark and felonious; enjoys advanced persistent walks through your infra'
        }
      ]
    }
  ]
}
