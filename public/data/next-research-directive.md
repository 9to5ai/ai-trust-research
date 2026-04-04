# Next Research Directive: Third-Party AI Risk & Supply Chain Attacks

## Source
Gary Ang PhD (author of MAS AI Risk Management Guidelines)
LinkedIn article: "A Simple Reading List on Third-Party AI Risk Management"
https://www.linkedin.com/pulse/simple-reading-list-third-party-ai-risk-management-gary-ang-phd-zb4qc

Requested by Ray on 2026-03-26.

## Focus
Develop strategies to tackle the **third-party AI risk problem**, using the **LiteLLM supply chain attack (March 24, 2026)** as a central case study.

### The LiteLLM Incident (March 24, 2026)
- Threat actor **TeamPCP** compromised LiteLLM PyPI packages (v1.82.7, v1.82.8)
- Attack chain: compromised Trivy security scanner → stole credentials → used them to poison LiteLLM's CI/CD pipeline
- Backdoored versions harvested SSH keys, cloud credentials (AWS/GCP/Azure), K8s tokens, DB passwords
- LiteLLM is a unified interface to 100+ LLM providers — centralizes API keys, making it a high-value target
- Cascading impact: LiteLLM is a transitive dependency in many AI frameworks
- The irony: the initial compromise vector was a *security scanner*
- TeamPCP also targeted Checkmarx GitHub Actions in the same campaign

## Required Reading List (from Gary Ang)

### Where and Why Does It Break?
1. **"AI Auditing: The Broken Bus on the Road to AI Accountability"** — Birhane et al. | IEEE SaTML (2024)
   - arXiv:2401.14462
   - Taxonomizes AI audit practices; finds many audits don't achieve accountability outcomes

2. **"Dislocated Accountabilities in the 'AI Supply Chain'"** — Widder & Nafus | Big Data & Society (2023)
   - arXiv:2209.09780
   - Developers assume "the next person" manages the risk — accountability gaps in modular AI

3. **"Understanding Accountability in Algorithmic Supply Chains"** — Cobbe, Veale & Singh | FAccT (2023)
   - arXiv:2304.14749
   - "Accountability horizon" concept — limited visibility in distributed supply chains, regulatory arbitrage

### How Can We Solve It?
4. **"AEF-1: Minimum Operating Conditions for Independent Third Party AI Evaluations"** — Stosz et al. | AI Evaluation Foundation (2025)
   - https://www.aef.one/aef-one.pdf
   - Defines what evaluators need: independence, access, transparency — the gap is the governance gap

5. **"Outsider Oversight: Designing a Third Party Audit Ecosystem for AI Governance"** — Raji et al. | AAAI/ACM AIES (2022)
   - arXiv:2206.04737
   - Lessons from financial/environmental regulation — audits alone won't achieve accountability

6. **"Model Cards for Model Reporting"** — Mitchell et al. | FAccT (2019)
   - arXiv:1810.03993
   - Foundational transparency proposal — 7 years later, vendor transparency is *declining*

7. **"Third-party compliance reviews for frontier AI safety frameworks"** — Homewood et al. | arXiv (2025)
   - arXiv:2505.01643
   - Independent compliance reviews — benefits vs challenges (infosec risk, cost, reputational damage)

8. **"Implementing AI Bill of Materials (AI BOM) with SPDX 3.0"** — Bennet et al. | Linux Foundation (2025)
   - arXiv:2504.16743
   - Extends SBOM to AI — algorithms, data, frameworks, licensing, compliance

9. **"AgentFacts: Universal KYA Standard for Verified AI Agent Metadata & Deployment"** — Grogan | arXiv (2025)
   - arXiv:2506.13794
   - "Know Your Agent" — cryptographically-signed capability declarations

10. **"Consultation Paper on Proposed Guidelines on Third-Party Risk Management"** — MAS (March 2026)
    - https://www.mas.gov.sg/-/media/mas-media-library/publications/consultations/bd/2026/consultation-paper---tprmg.pdf
    - Supersedes old outsourcing guidelines — covers all third-party arrangements, AI in footnote

## Analysis Angles
- Map the LiteLLM incident against each paper's framework — where did each layer fail?
- Develop a practical third-party AI risk strategy for financial services
- Compare MAS TPRM guidelines with APRA CPS 230/234 on AI supply chain coverage
- Propose an "AI Supply Chain Security Maturity Model" combining AI BOM + KYA + audit ecosystem
- Key question from Gary: "How do you govern AI you don't control? And maybe don't even know exists?"
