import { Dependency, SBOMDataProps, Vulnerability } from "./types";

export class SBOM {
  components: SBOMDataProps["components"];
  vulnerabilities: SBOMDataProps["vulnerabilities"];
  dependencies: SBOMDataProps["dependencies"];

  constructor(data: SBOMDataProps) {
    this.components = data.components;
    this.vulnerabilities = data.vulnerabilities;
    this.dependencies = data.dependencies;
  }

  getVulnerabilityScores(): number[] {
    const vulScores = this.vulnerabilities.map((vul) =>
      vul.ratings[0].score ? vul.ratings[0].score : 0
    );
    return vulScores;
  }

  getVulnerability(componentBomRef: string): Vulnerability | undefined {
    const vulnerabilities = this.vulnerabilities;
    for (let i = 0; i < vulnerabilities.length; i++) {
      for (let j = 0; j < vulnerabilities[i].affects.length; j++) {
        if (vulnerabilities[i].affects[j].ref === componentBomRef) {
          return vulnerabilities[i];
        }
      }
    }
    return undefined;
  }

  isVulnerableByDependency(component: Component): boolean {
    const dependencies = this.dependencies;
    return true;
  }
}
