export type SBOMDataProps = {
  // getVulnerabilityScores: () => number[];
  // getVulnerability: (id: string) => Vulnerability | undefined;
  bomFormat?: "CycloneDX";
  specVersion?: string;
  serialNumber?: string;
  version?: number;
  metadata?: Metadata;
  dependencies: Dependency[];
  components: Component[];
  vulnerabilities: Vulnerability[];
};

/**
 * Metadata Data Structure
 */

export type Metadata = {
  timestamp: string;
  tools: Tool[];
  component: {
    name: string;
    version: string;
    type: string;
    ["bom-ref"]: string;
  };
};

export type Tool = {
  vendor: string;
  name: string;
  version: string;
};

/**
 * Dependency Data Structure
 */
export type Dependency = {
  ref: string;
  dependsOn: string[];
};

/**
 * SBOM Data Structure
 */

export type Component = {
  group: string;
  name: string;
  version: string;
  description: string;
  hashes: Hash[];
  liscenses: Liscense[];
  purl: string;
  externalReferences: ExternalReference[];
  type: string;
  ["bom-ref"]: string;
  // vulnerability: Vulnerability | undefined;
  // dependencies: Dependency[];
  directImport?: boolean;
};

export type ExternalReference = {
  type: string;
  url: string;
};

export type Hash = {
  alg: string;
  content: string;
};

export type Liscense = {
  liscense: {
    id: string;
    url: string;
  };
};

/**
 * Vulnerability Data Structure
 */
export type Vulnerability = {
  ["bom-ref"]: string;
  id: string;
  sorce: {
    name: string;
    url: string;
  };
  ratings: Rating[];
  description: string;
  published: string;
  updated: string;
  cwes: number[];
  affects: { ref: string }[];
};

export type Rating = {
  source: {
    name: string;
    url: string;
  };
  score: number;
  severity: string;
  method: string;
  vector: string;
};
