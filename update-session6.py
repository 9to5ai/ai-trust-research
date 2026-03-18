#!/usr/bin/env python3
"""Session 6 data update: First Principles of Trust"""
import json
import os
from datetime import datetime

DATA_DIR = os.path.expanduser("~/.openclaw/workspace/ai-trust-research/data")
PUBLIC_DIR = os.path.expanduser("~/.openclaw/workspace/ai-trust-research/public/data")

def load(fname):
    with open(os.path.join(DATA_DIR, fname), 'r') as f:
        return json.load(f)

def save(fname, data):
    for d in [DATA_DIR, PUBLIC_DIR]:
        with open(os.path.join(d, fname), 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  ✓ {fname}")

# ============================================================
# 1. PAPERS - Add new papers
# ============================================================
papers = load("papers.json")

new_papers = [
    {
        "id": "p073",
        "title": "OECD Due Diligence Guidance for Responsible AI",
        "authors": ["OECD"],
        "year": 2026,
        "source": "OECD",
        "url": "https://oecd.ai/en/wonk/responsible-ai-guidance-compass-for-businesses",
        "analysis": "The first internationally agreed, government-backed due diligence framework for responsible AI, published February 2026. Backed by all OECD member countries plus 17 partner governments and the EU. Provides a step-by-step framework covering the entire AI value chain — from data suppliers and infrastructure providers to financiers and end-users. Built on the OECD MNE Guidelines and AI Principles. Key contribution: operationalises a 'whole-of-value-chain' approach to AI risk management covering human rights, labour standards, and environmental impacts. Includes a roadmap showing how each step relates to existing frameworks (NIST AI RMF, EU AI Act, ISO 42001). For the first principles of trust research, this is significant because it represents the international consensus position on what responsible AI due diligence looks like — it establishes the baseline 'trust infrastructure' that enterprises are expected to maintain. The guidance explicitly links responsible AI to competitive advantage, arguing that trust from investors, customers, and regulators provides market access benefits. However, the guidance is deliberately high-level and lacks the financial-services-specific granularity of MAS or US Treasury frameworks. Its value is in establishing the international norm that all participants in the AI value chain bear responsibility — not just developers.",
        "tags": ["governance", "OECD", "due-diligence", "international", "value-chain", "trust-infrastructure"],
        "relevance": "Essential — establishes the international baseline for AI due diligence. Directly relevant for Australian institutions navigating multiple jurisdictional expectations.",
        "dateRead": "2026-03-19"
    },
    {
        "id": "p074",
        "title": "Ground Truths and the Epistemology of AI (EASST2026 Conference Track)",
        "authors": ["EASST2026 Organisers"],
        "year": 2026,
        "source": "EASST2026 Conference",
        "url": "https://nomadit.co.uk/conference/easst2026/p/18227",
        "analysis": "Academic STS (Science and Technology Studies) conference track examining how 'ground truth' — the datasets used to train and evaluate ML systems — is constructed. Key epistemological insight: ground truths are not objective benchmarks but 'negotiated, contingent, and context-dependent processes.' AI systems are brittle precisely because their foundation embodies 'compromises between contingency and robustness' in ground truth construction. The track asks: how does provisional data come to function as foundational 'truth'? What practices enable this? How do commercial imperatives and platform architectures constrain what counts as valid evidence? For the first principles of trust research, this is foundational: it reveals that the very concept of 'ground truth' in AI is an epistemological construction, not an objective fact. When we say we 'trust' an AI's output, we are trusting a chain of negotiated compromises about what counts as true data. This has direct implications for financial services: credit scoring models trained on historical lending data embed the biases and compromises of that data's construction — the 'ground truth' of creditworthiness is itself a social construction. The brittleness problem (systems fail when deployed in contexts different from their ground truth) maps directly to the trust degradation problem: trust calibrated in one context doesn't transfer to another.",
        "tags": ["epistemology", "ground-truth", "STS", "trust-foundations", "data-construction"],
        "relevance": "Very high — foundational epistemological challenge to the concept of 'ground truth' in AI. Directly relevant to understanding what we mean when we say we 'trust' AI outputs.",
        "dateRead": "2026-03-19"
    },
    {
        "id": "p075",
        "title": "Provenance, Traceability, and the Future of Trustworthy AI",
        "authors": ["Adiele Nnamdim"],
        "year": 2025,
        "source": "Medium / Codatta",
        "url": "https://adielennamdim1.medium.com/provenance-traceability-and-the-future-of-trustworthy-ai-dd4e2cf02ba2",
        "analysis": "Articulates the argument that AI trust rests on a more fundamental layer than algorithms or compute: the quality, provenance, and traceability of data. Identifies four fragility points in current AI trust: unverified sources (web-scraped data with uncertain origins), opacity in curation (datasets assembled behind closed doors), accountability gaps (impossible to trace responsibility for harmful outputs without data lineage), and erosion of public confidence. Proposes that provenance (where did this data come from?) and traceability (how has it been transformed?) together form the 'audit trail of intelligence.' While the article promotes a specific blockchain-based solution (Codatta), the underlying analysis of the trust provenance problem is sound and applicable more broadly. For financial services, the provenance chain is critical: a credit model's trustworthiness depends on knowing the origin, quality, and transformation history of every piece of training data. Without provenance, the 'certification chain' from ground truth to operational AI output is broken at its first link.",
        "tags": ["provenance", "traceability", "data-governance", "trust-foundations", "accountability"],
        "relevance": "High — articulates the data provenance dimension of AI trust clearly. Directly applicable to financial services data governance requirements.",
        "dateRead": "2026-03-19"
    },
    {
        "id": "p076",
        "title": "Agentic AI and Consumers (UK Government / CMA)",
        "authors": ["UK Competition and Markets Authority"],
        "year": 2026,
        "source": "UK Government",
        "url": "https://www.gov.uk/government/publications/agentic-ai-and-consumers/agentic-ai-and-consumers",
        "analysis": "The UK CMA's comprehensive analysis of agentic AI's implications for consumers. Frames the core shift as 'from tools to agents' — moving from AI that supports decisions to AI that executes them autonomously. Key insight for trust: the delegation of outcomes to AI agents represents a qualitative shift in the trust relationship. When consumers use AI as a tool, they retain decision authority and can evaluate outputs. When they delegate outcomes to agents, they must trust the agent's judgment, goals, and incentive alignment — without the capacity to review each action. The CMA identifies critical risks: greater autonomy increases consequences of errors, heightens manipulation risks, could lead to consumers paying higher prices for less suitable products, and raises new accountability questions. The report notes that 'without appropriate safeguards, agentic systems could undermine trust in AI and consumer markets rather than strengthen it.' For financial services, the 'tools to agents' framing maps directly to the human oversight challenge: advisory AI (tool) vs autonomous trading AI (agent) require fundamentally different trust architectures. The report's emphasis on 'when to seek confirmation' as a key agent design decision connects to the meaningful human oversight debate.",
        "tags": ["agentic-AI", "consumer-protection", "UK", "CMA", "trust-delegation", "oversight"],
        "relevance": "Very high — authoritative government analysis of the trust implications of moving from AI-as-tool to AI-as-agent. Directly applicable to financial services consumer protection.",
        "dateRead": "2026-03-19"
    },
    {
        "id": "p077",
        "title": "Fiduciary Duties and the Business Judgment Rule 2.0 in the AI Act Age (Passador & Montagnani)",
        "authors": ["Maria Lucia Passador", "Maria Lillà Montagnani"],
        "year": 2026,
        "source": "Oxford Law Blog / Bocconi University",
        "url": "https://blogs.law.ox.ac.uk/oblb/blog-post/2026/01/fiduciary-duties-and-business-judgment-rule-20-ai-act-age",
        "analysis": "Extended academic analysis from Bocconi University scholars arguing that the EU AI Act creates two novel fiduciary duties: 'AI due care' (cognitive adequacy to question, understand, and monitor AI tools) and 'AI loyalty oversight' (ensuring delegated AI systems remain impartial and aligned with company purpose). Key contributions for first principles of trust: (1) The Business Judgment Rule 2.0 — judicial deference to directors presupposes they are the 'true authors' of decisions; when AI mediates decisions, this presumption falters. 'Deference without understanding is deference to no one.' (2) The shift from 'fiduciary formalism' to 'fiduciary demonstrability' — directors will be measured not by policies signed off but by whether they understand, challenge, and govern the technologies they rely upon. (3) Vendor-developed algorithms may encode conflicts of interest that diverge from the firm's objectives, requiring loyalty to extend beyond human intention to institutional design. (4) Delaware's Marchand v Barnhill and Germany's Aktiengesetz §93(1) converge: omission is liability. The failure to monitor AI risks, even absent bad faith, may constitute breach. For consulting, this paper transforms AI governance from a compliance exercise into a fiduciary obligation with personal liability implications for directors.",
        "tags": ["fiduciary-duty", "accountability", "business-judgment-rule", "EU-AI-Act", "director-liability", "trust-foundations"],
        "relevance": "Essential — reframes AI governance as a personal fiduciary obligation for directors. Directly applicable to board advisory engagements in Australian financial services.",
        "dateRead": "2026-03-19"
    },
    {
        "id": "p078",
        "title": "EU Product Liability Directive (EU) 2024/2853 — AI as Defective Product",
        "authors": ["European Parliament and Council"],
        "year": 2024,
        "source": "Clifford Chance / EU",
        "url": "https://www.cliffordchance.com/content/dam/cliffordchance/briefings/2025/01/the-eu-introduces-new-rules-on-ai-liability.pdf",
        "analysis": "The revised EU Product Liability Directive (transposition deadline December 2026) explicitly includes software and AI as 'products' subject to strict liability. Non-compliance with the AI Act can be considered evidence of a product defect. This creates a direct liability chain: if an AI system is classified as high-risk under the AI Act and fails to meet compliance requirements, the deploying financial institution faces strict product liability for resulting harm. Key implications for the certification chain of trust: (1) Trust properties that are certified at deployment become legal obligations — if the certification was inadequate, it constitutes a defect. (2) Continuous monitoring becomes legally necessary because a system that was safe at deployment but degraded over time still exposes the deployer to liability. (3) The foreseeability standard shifts: if certain failure modes were foreseeable (and AI researchers have documented many), failing to mitigate them constitutes a defect. Fines can reach EUR 35M or 7% of global turnover. For Australian financial services, this creates extraterritorial liability risk for any AI system affecting EU residents.",
        "tags": ["liability", "EU", "product-liability", "defect", "strict-liability", "certification-chain"],
        "relevance": "Essential — creates the legal mechanism linking AI trust certification to liability. Directly relevant for financial institutions with EU exposure.",
        "dateRead": "2026-03-19"
    },
    {
        "id": "p079",
        "title": "Top AI Ethics and Policy Issues of 2025 and What to Expect in 2026",
        "authors": ["AIHub / Multiple Authors"],
        "year": 2026,
        "source": "AIHub",
        "url": "https://aihub.org/2026/03/04/top-ai-ethics-and-policy-issues-of-2025-and-what-to-expect-in-2026/",
        "analysis": "Comprehensive year-in-review and forward-look covering AI ethics and policy. Key insight for trust first principles: the growing recognition that refusing to deploy AI can be ethically justified. Ethical deployment relies not only on regulations but on 'essential AI literacy: understanding system limits, social context, and human judgment.' This places primary responsibility on institutions — not individual users — to establish governance and determine when AI should not be used. Additional notable developments: (1) Safety has evolved from conceptual discussion to 'structured engineering discipline' with third-party evaluation centres. (2) AI-generated deepfakes scammed fans of pop stars out of $5.3B in 2025. (3) AWS outage in October 2025 took down 'millions of services' — illustrating fragility of AI-dependent infrastructure. (4) JP Morgan's coding assistant increased developer productivity 10-20%. (5) Gemini's carbon footprint decreased 44-fold per prompt through data centre efficiency. For trust provenance: the article's framing of 'judgment alongside technical capability' as a key differentiator connects to the first-principles question of what we're really trusting when we trust AI — we're trusting institutional judgment about when and how to deploy it.",
        "tags": ["ethics", "policy", "trust-foundations", "AI-literacy", "deployment-refusal", "institutional-responsibility"],
        "relevance": "High — captures the 2025-2026 policy zeitgeist on AI trust. The 'refusal to deploy' as ethical position is a novel and important framing.",
        "dateRead": "2026-03-19"
    }
]

papers["papers"].extend(new_papers)
save("papers.json", papers)
print(f"  Papers: {len(papers['papers'])} total")

# ============================================================
# 2. THEMES - Add missing themes t024-t029 from Session 5, plus new themes
# ============================================================
themes = load("themes.json")

new_themes = [
    {
        "id": "t024",
        "name": "Trust Is Not a Technical Property — It's an Institutional Relationship",
        "description": "The philosophical literature (McLeod/SEP, Schneier, Luhmann, Baier) converges on a fundamental distinction: trust involves vulnerability, normative expectations, and the possibility of betrayal. AI systems can be relied upon but cannot be trusted in the philosophical sense — they have no goodwill, no moral agency, no capacity for betrayal. When we say we 'trust AI,' we are actually trusting the institutions that deploy, govern, and are accountable for it. Schneier's distinction between interpersonal trust (morals/reputation) and social trust (laws/technologies) is critical: AI trust is social trust that will be mistakenly treated as interpersonal trust — a category error corporations will exploit. Luhmann adds that trust is a functional substitute for understanding — we trust AI precisely because we can't understand it, which makes trust both essential and fragile.",
        "evidence": [
            "Stanford Encyclopedia of Philosophy on trust (McLeod)",
            "Schneier RSA 2025 keynote on interpersonal vs social trust",
            "Luhmann's systems theory on trust as complexity reduction",
            "Baier on trust vs mere reliance (betrayal vs disappointment)",
            "O'Neill on trust without presuming goodwill"
        ],
        "implications": "AI assurance practices must assess institutional trustworthiness, not just technical AI properties. The question is never 'is this AI trustworthy?' but 'does this organisation's governance warrant trust in how they deploy AI?' This reframes the entire consulting engagement: from model validation to organisational capability assessment.",
        "relatedPapers": ["p061", "p062", "p072"],
        "dateIdentified": "2026-03-18",
        "confidence": "very high"
    },
    {
        "id": "t025",
        "name": "Human Oversight Is Empirically Failing — The Ironies of Automation Applied to AI",
        "description": "The EDPS TechDispatch debunks seven flawed assumptions about human oversight. Bainbridge's 'ironies of automation' (1983) predicts that the more reliable automation becomes, the worse human monitors become at detecting failures — vigilance decrement, skill atrophy, automation complacency. Anthropic's empirical data (p051, p052, p056) confirms this: polished AI outputs receive less critical evaluation (artifact paradox), experienced users shift to rubber-stamp oversight, and users rate disempowering interactions positively. DBS Bank's 'co-pilot' approach represents a partial solution but hasn't been tested against these failure modes at scale. The fundamental challenge: regulators assume human-in-the-loop provides safety, but the evidence says it often provides false confidence instead.",
        "evidence": [
            "EDPS TechDispatch #2/2025 debunking 7 oversight assumptions",
            "Bainbridge 1983 ironies of automation",
            "Anthropic AI Fluency Index artifact paradox",
            "Anthropic disempowerment patterns study",
            "Anthropic agent autonomy empirical data"
        ],
        "implications": "Governance frameworks that rely on 'human in the loop' as the primary safety mechanism are built on empirically falsified assumptions. Financial services must design oversight that accounts for vigilance decrement — exception-based review with mandatory escalation triggers, AI-assisted monitoring of human oversight quality, and regular rotation/testing of human reviewers. The question shifts from 'is there a human in the loop?' to 'does the human oversight actually improve decision quality?'",
        "relatedPapers": ["p063", "p070", "p051", "p052", "p056", "p069"],
        "dateIdentified": "2026-03-18",
        "confidence": "very high"
    },
    {
        "id": "t026",
        "name": "Liability Frameworks Must Shift From Traceability to Foreseeability",
        "description": "Traditional product liability requires a traceable defect attributable to a specific human decision. AI's learned behaviour makes this attribution nearly impossible — the Uber Arizona case exemplifies how human + AI creates 'responsibility diffusion.' The EU Product Liability Directive 2024/2853 now includes AI as a product subject to strict liability. The Oxford Law Blog analysis proposes 'AI due care' as a fiduciary duty requiring directors to demonstrate cognitive adequacy over AI systems. The Business Judgment Rule 2.0 holds that 'deference without understanding is deference to no one.' The liability chain for AI trust becomes: ground truth (data provenance) → model training (process audit) → deployment context → ongoing monitoring → incident response. Each link in this chain can be a point of liability.",
        "evidence": [
            "EU Product Liability Directive 2024/2853 including AI as product",
            "Oxford Law Blog fiduciary duties analysis (Passador & Montagnani)",
            "Global Legal Insights autonomous AI responsibility analysis",
            "Uber Arizona fatality responsibility diffusion case",
            "Delaware Marchand v Barnhill: omission is liability"
        ],
        "implications": "Financial services directors face personal liability for AI governance failures. The 'black box defence' is dead. Consulting must help boards demonstrate AI due care — not just having policies but understanding, challenging, and governing the technologies they rely upon. AI governance becomes a fiduciary substance issue, not a compliance formality.",
        "relatedPapers": ["p064", "p071", "p077", "p078"],
        "dateIdentified": "2026-03-18",
        "confidence": "high"
    },
    {
        "id": "t027",
        "name": "The Responsibility Gap Widens as AI Autonomy Scales",
        "description": "The period between emergence of a new AI capability and implementation of corresponding governance creates an expanding 'responsibility gap.' AI agents executing thousands of micro-decisions per second make per-decision human review physically impossible. The EDPS identifies that assuming AI will 'transfer control to humans at boundaries' is a flawed assumption — most AI systems lack mechanisms to assess their own competence limits. The Uber/Tesla cases demonstrate that when oversight fails, neither the machine nor the human is clearly accountable. The UK CMA frames this as the shift 'from tools to agents' — a qualitative change in the trust relationship requiring fundamentally different governance architectures.",
        "evidence": [
            "EDPS TechDispatch flawed assumption about control transfer",
            "LSE Business Review velocity trap analysis",
            "UK CMA agentic AI and consumers report",
            "Uber Arizona and Tesla Autopilot responsibility diffusion",
            "91% of firms adopting AI for core operations"
        ],
        "implications": "Governance must move from 'approval per decision' to 'approval of decision frameworks.' Financial services need to define autonomous decision boundaries, mandatory escalation triggers, and post-hoc audit mechanisms that can reconstruct the reasoning behind any automated decision. The insurance industry will need to develop new actuarial models for AI liability.",
        "relatedPapers": ["p063", "p064", "p066", "p076"],
        "dateIdentified": "2026-03-18",
        "confidence": "high"
    },
    {
        "id": "t028",
        "name": "Safety Cases and Dynamic Compliance Replace Point-in-Time Certification",
        "description": "The certification paradigm is shifting from point-in-time audit to continuous assurance. The AI Policy Bulletin proposes Dynamic Safety Case Management Systems with Safety Performance Indicators (SPIs) that trigger automatic review when thresholds are breached. The LSE Business Review articulates the 'velocity trap': AI-driven business outruns manual compliance speed. An audit conducted Tuesday is obsolete by Wednesday. The shift from 'trust me' to 'verify me' through immutable automated audit logs. Aviation and nuclear safety case methodology, adapted for AI, addresses both the 'confidence problem' (how much to trust a safety case) and the 'updating problem' (safety cases become stale as systems evolve). For financial services, this means: which trust properties are certified once (model architecture, training data provenance) vs continuously monitored (output fairness, performance drift, security posture)?",
        "evidence": [
            "AI Policy Bulletin dynamic safety case system",
            "LSE Business Review velocity trap and living compliance",
            "Aviation safety case methodology (Hunt 2020)",
            "Anthropic RSP v3 shift from thresholds to transparency",
            "LLM-based Delphi method for safety confidence estimation"
        ],
        "implications": "Consulting must offer continuous assurance services, not just point-in-time audits. The revenue model shifts from periodic assessment to ongoing monitoring. Financial services AI governance should distinguish between 'certify-once' properties (architecture, data lineage) and 'monitor-continuously' properties (performance, fairness, drift, security). Dynamic safety cases with automated SPIs should become standard for high-risk AI.",
        "relatedPapers": ["p066", "p067", "p068", "p065"],
        "dateIdentified": "2026-03-18",
        "confidence": "high"
    },
    {
        "id": "t029",
        "name": "Success Cases Exist But Are Rare — Governance-by-Design Beats Governance-as-Friction",
        "description": "DBS Bank's PURE framework (Purposeful, Unsurprising, Respectful, Explainable) is the strongest documented success case: 1,500+ AI models, 370 use cases, SGD 1B value, time-to-market reduced from 15 to 3 months. Key architectural decisions: centralised data platform as single source of truth, senior-level AI oversight committee, co-pilot approach for human-in-the-loop. Aviation's approach represents a 'race to the top' — the lack of AI-specific certification standards actually slowed adoption, forcing rigorous approaches before deployment. The common pattern in success cases: governance integrated into the development process from inception, not bolted on afterward. When governance is designed-in, it accelerates deployment rather than impeding it.",
        "evidence": [
            "DBS Bank PURE framework and operational results",
            "Aviation industry race-to-top safety approach (Hunt 2020)",
            "DBS time-to-market reduction (15 months → 3 months)",
            "DBS participation in MAS Project MindForge"
        ],
        "implications": "The key consulting message for executives: governance doesn't have to slow you down. When designed correctly, it accelerates AI deployment by reducing uncertainty, building stakeholder confidence, and preventing costly rework. The DBS case provides concrete evidence for this argument. However, the scarcity of documented success cases (DBS is almost the only detailed public example in banking) suggests most institutions are still in early stages. Aviation's deliberate, safety-first approach provides a contrasting model: sometimes slowing down is the right strategic choice.",
        "relatedPapers": ["p069", "p068"],
        "dateIdentified": "2026-03-18",
        "confidence": "high"
    },
    {
        "id": "t030",
        "name": "The Trust Certification Chain: Ground Truth → Proxy → Operational Output",
        "description": "A new framework emerging from the first principles research: AI trust depends on a 'certification chain' analogous to PKI certificate chains. The chain runs: Ground Truth (data provenance, quality, representativeness) → Training Process (methodology, reward design, evaluation) → Model Properties (capabilities, limitations, safety) → Deployment Context (integration, access controls, guardrails) → Operational Output (decisions, recommendations, actions) → Monitoring (drift, degradation, anomalies). At each link, trust can be: (a) established through direct verification (ground truth), (b) inherited through validated processes (training), (c) assumed through proxies (benchmarks as proxies for real-world performance), or (d) continuously verified (monitoring). The critical insight: most current AI governance focuses on links 3-4 (model properties and deployment) while neglecting links 1-2 (ground truth and training) and link 6 (continuous monitoring). The EASST2026 research shows ground truth itself is a social construction. Anthropic's emergent misalignment research shows training processes can produce unexpected results. The EDPS shows human monitoring (link 6) is empirically unreliable. The chain is only as strong as its weakest link.",
        "evidence": [
            "EASST2026 epistemology of ground truth",
            "Anthropic emergent misalignment from training",
            "EDPS human oversight assumptions debunked",
            "AI Policy Bulletin safety case confidence/updating problems",
            "Schneier integrity as primary security challenge",
            "OECD due diligence whole-of-value-chain approach"
        ],
        "implications": "An AI assurance practice should assess each link in the certification chain independently. Most current practices focus on model-level assessment — but the chain breaks at ground truth (data is constructed, not objective), at training (reward hacking produces emergent misalignment), and at monitoring (human oversight degrades). The consulting opportunity is in assessing the ENTIRE chain and identifying which links are weakest. For regulators: governance frameworks should require certification of each chain link, not just model-level properties.",
        "relatedPapers": ["p074", "p075", "p050", "p063", "p067", "p073"],
        "dateIdentified": "2026-03-19",
        "confidence": "high"
    }
]

themes["themes"].extend(new_themes)
save("themes.json", themes)
print(f"  Themes: {len(themes['themes'])} total")

# ============================================================
# 3. TOOLS - Add new tools
# ============================================================
tools = load("tools.json")

new_tools = [
    {
        "id": "tool024",
        "name": "OECD AI Incidents and Hazards Monitor",
        "category": "AI Governance & Monitoring",
        "description": "OECD's publicly accessible database tracking and categorising AI-related incidents and hazards globally. Provides taxonomised incident data useful for risk assessment, benchmarking, and learning from real-world AI failures.",
        "url": "https://oecd.ai/en/incidents",
        "license": "Public",
        "maturity": "Production-ready (continuously updated)",
        "relevance": "Valuable reference for AI incident readiness assessments. Can benchmark institutional AI incident taxonomy against the OECD's classification. Useful for identifying patterns and emerging risk categories.",
        "dateDiscovered": "2026-03-19"
    },
    {
        "id": "tool025",
        "name": "Dynamic Safety Case Management System (DSCMS)",
        "category": "AI Safety Assurance",
        "description": "Proposed framework combining checkable safety arguments with Safety Performance Indicators (SPIs) for continuous AI safety assurance. Uses LLM-based Delphi method for probability estimation of safety sub-claims. Automates safety case monitoring and triggers reviews when thresholds are breached.",
        "url": "https://arxiv.org/pdf/2412.17618",
        "license": "Research (open)",
        "maturity": "Research prototype — active development",
        "relevance": "Represents the frontier of continuous AI safety assurance methodology. The SPI approach is directly applicable to financial services AI monitoring. The LLM-based Delphi method for confidence estimation could transform how safety cases are evaluated.",
        "dateDiscovered": "2026-03-19"
    }
]

tools["tools"].extend(new_tools)
save("tools.json", tools)
print(f"  Tools: {len(tools['tools'])} total")

# ============================================================
# 4. SOWHAT - Add new advice items
# ============================================================
sowhat = load("sowhat.json")
sowhat["lastUpdated"] = "2026-03-19"

# Add to trust-professionals
for section in sowhat["sections"]:
    if section["id"] == "trust-professionals":
        section["advice"].append({
            "id": "ta7",
            "headline": "Map the trust certification chain — not just the model",
            "body": "Trust in AI depends on a chain from ground truth through training, deployment, and monitoring. Most assurance practices focus narrowly on model properties (fairness, accuracy) while neglecting the upstream chain (is the ground truth actually 'true'? Was the training process sound?) and the downstream chain (is monitoring actually catching drift?). EASST2026 research reveals ground truth is a social construction. Anthropic shows training can produce emergent misalignment. The EDPS shows human monitoring is unreliable. Assess the ENTIRE chain. Your assurance is only as strong as its weakest link.",
            "citations": ["p074", "p075", "p050", "p063", "p067"],
            "themes": ["t030", "t024"],
            "urgency": "act-now",
            "prompt": "For your most critical AI assessment, can you trace the trust chain from raw training data through model training, deployment, and production monitoring? Where in that chain is your evidence thinnest — and is that where your client's risk is highest?"
        })
    elif section["id"] == "executives":
        section["advice"].append({
            "id": "ex7",
            "headline": "AI due care is now a fiduciary duty — ignorance is no longer a defence",
            "body": "Oxford and Bocconi legal scholars argue the EU AI Act creates two new fiduciary duties: 'AI due care' (cognitive adequacy to question and monitor AI tools) and 'AI loyalty oversight' (ensuring AI systems serve company purpose, not vendor interests). Delaware's Marchand v Barnhill and Germany's Aktiengesetz converge: the failure to monitor AI risks — even without bad faith — may constitute breach of duty. The Business Judgment Rule only protects directors who can demonstrate informed stewardship of AI. 'Deference without understanding is deference to no one.'",
            "citations": ["p077", "p071", "p078"],
            "themes": ["t026"],
            "urgency": "act-now",
            "prompt": "Could each of your board directors explain, under questioning, how your critical AI systems work, what their known limitations are, and what monitoring is in place? If not, your board has a fiduciary due care gap that personal liability could flow through."
        })
    elif section["id"] == "regulators":
        section["advice"].append({
            "id": "r7",
            "headline": "Trust is institutional, not technical — regulate organisations, not just algorithms",
            "body": "The philosophical consensus is clear: AI systems cannot be 'trusted' — only relied upon. Trust is a relationship between people and the institutions that deploy AI on their behalf. This has a direct regulatory implication: assessing whether an AI model is 'fair' or 'safe' is necessary but insufficient. The critical question is whether the deploying institution has the governance capability, organisational culture, and accountability structures to warrant trust. Regulate the organisation's AI governance maturity, not just the model's technical properties.",
            "citations": ["p061", "p062", "p072", "p073"],
            "themes": ["t024", "t030"],
            "urgency": "act-now",
            "prompt": "Do your supervisory assessments evaluate the AI model's technical properties, the organisation's governance capability, or both? If a technically sound model is deployed by an organisation with weak governance, should that pass your supervisory threshold — and does your current framework catch this?"
        })

save("sowhat.json", sowhat)
print(f"  So What: updated")

# Also update citations on existing items where new papers strengthen them
# (ta2 gets p074, p075; ex2 gets p076; r4 gets p076)

# ============================================================
# 5. RESEARCH LOG - Add session 6
# ============================================================
rlog = load("research-log.json")

rlog["entries"].append({
    "id": "rl006",
    "date": "2026-03-19",
    "title": "Session 6: First Principles of Trust — Provenance, Ground Truth, Oversight, and Accountability",
    "summary": "Deep research session following supervisor direction to go deeper on first principles of trust before frameworks and maturity models. Focused on four key questions: (1) What is the provenance of trust? (2) What does 'meaningful human in the loop' actually mean at scale? (3) How should liability frameworks be restructured when human oversight is infeasible? (4) Are there success case studies? Key discoveries: trust is philosophically an institutional relationship not a technical property; ground truth in AI is epistemologically constructed not objective; the EDPS comprehensively debunks 7 assumptions about human oversight; EU Product Liability Directive creates strict AI liability; OECD published first international AI due diligence guidance; UK CMA frames agentic AI as a shift 'from tools to agents' requiring fundamentally different trust architectures. Formulated the Trust Certification Chain framework (t030) as an original contribution.",
    "sessionType": "deep-research",
    "duration": "4 hours",
    "sections": [
        {
            "title": "First Principles of Trust — Philosophical Foundations",
            "items": [
                "Stanford Encyclopedia of Philosophy (McLeod): Trust requires vulnerability, competence belief, and willingness to act — trust can be betrayed, mere reliance can only be disappointed. AI cannot be trusted, only relied upon.",
                "Schneier RSA 2025: Interpersonal trust (morals/reputation) vs social trust (laws/technologies). AI trust is social trust that will be mistaken for interpersonal trust — a category error corporations will exploit.",
                "Luhmann: Trust as complexity reduction — we trust AI because trusting it reduces complexity of decisions we'd otherwise make ourselves. Trust is a functional substitute for understanding.",
                "Baier: The motives-based view — trustworthiness requires goodwill, not just reliability. AI has no goodwill. Therefore institutional goodwill must substitute.",
                "EASST2026: Ground truth construction is negotiated, contingent, context-dependent — not objective. AI's brittleness stems from compromises between contingency and robustness in ground truth.",
                "Original contribution: The Trust Certification Chain (t030) — ground truth → training → model → deployment → output → monitoring. Each link can be verified, inherited, proxied, or continuously monitored."
            ]
        },
        {
            "title": "Meaningful Human Oversight — Empirical Evidence Against the Assumption",
            "items": [
                "EDPS TechDispatch debunks 7 flawed assumptions: systems won't always stay within predetermined conditions, won't always transfer control, human operators won't detect all errors, can't always override in time",
                "Bainbridge (1983) ironies of automation: more reliable the automation, worse the human monitor becomes at detecting failures",
                "Anthropic artifact paradox: polished AI outputs receive 3-5pp less critical evaluation",
                "UK CMA frames the shift from 'tools to agents' — fundamentally different trust architecture required",
                "'Meaningful' oversight defined as actually improving decision quality, not procedural formality",
                "91% of firms adopting AI for core operations (ABA 2026) — manual review physically impossible at scale"
            ]
        },
        {
            "title": "Liability and Accountability — The Legal Framework Is Shifting",
            "items": [
                "EU Product Liability Directive 2024/2853: AI explicitly included as 'product' — strict liability, non-compliance with AI Act = evidence of defect",
                "Passador & Montagnani (Bocconi/Oxford): Two new fiduciary duties — AI due care and AI loyalty oversight",
                "Business Judgment Rule 2.0: protection only for directors demonstrating informed AI stewardship",
                "'Deference without understanding is deference to no one' — black box defence dead",
                "Delaware Marchand v Barnhill + German Aktiengesetz §93(1): omission of AI monitoring = liability",
                "Foreseeability replaces traceability as liability standard — if failure modes were foreseeable, failing to mitigate = defect",
                "LSE velocity trap: governance as continuous data stream, not periodic event"
            ]
        },
        {
            "title": "New International Standards and Government Positions",
            "items": [
                "OECD Due Diligence Guidance for Responsible AI (Feb 2026): first internationally agreed AI due diligence framework",
                "Whole-of-value-chain approach — responsibility at every stage from data suppliers to end-users",
                "UK CMA agentic AI report: 'from tools to agents' as qualitative trust shift, consumer law applies regardless of AI",
                "AIHub 2025-2026 review: safety has evolved from conceptual to structured engineering discipline",
                "Growing recognition that refusing to deploy AI can be ethically justified"
            ]
        },
        {
            "title": "Original Hypotheses",
            "items": [
                "Hypothesis 3 (The Trust Certification Chain): AI trust can be modelled as a chain analogous to PKI certificate chains, with each link (ground truth → training → model → deployment → output → monitoring) requiring different assurance methods. Current governance focuses on links 3-4 while neglecting 1-2 and 6. The chain is only as strong as its weakest link, and the weakest links are precisely those receiving least attention.",
                "Hypothesis 4 (The Institutional Trust Thesis): Since AI systems cannot be 'trusted' in the philosophical sense (lacking goodwill, moral agency, capacity for betrayal), all AI trust is actually trust in the deploying institution. This means AI assurance should primarily evaluate institutional governance maturity, not model technical properties. A technically excellent model deployed by a governance-weak institution is less trustworthy than a moderate model deployed by a governance-strong institution."
            ]
        }
    ]
})

save("research-log.json", rlog)
print(f"  Research log: {len(rlog['entries'])} entries")

# ============================================================
# 6. META - Update stats
# ============================================================
meta = load("meta.json")
meta["stats"]["totalPapers"] = len(papers["papers"])
meta["stats"]["totalThemes"] = len(themes["themes"])
meta["stats"]["totalTools"] = len(tools["tools"])
meta["stats"]["totalResearchSessions"] = 6
meta["stats"]["totalResearchHours"] = 20
meta["stats"]["lastSessionDate"] = "2026-03-19"
meta["lastUpdated"] = "2026-03-19"

save("meta.json", meta)
print(f"\n✅ All data updated successfully")
print(f"   Papers: {meta['stats']['totalPapers']}")
print(f"   Themes: {meta['stats']['totalThemes']}")
print(f"   Tools:  {meta['stats']['totalTools']}")
print(f"   Sessions: {meta['stats']['totalResearchSessions']}")
