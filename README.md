# AI Architecture PoC

Hierarchy:
    1. Architecture Strategy - A Vision high level statements, conceptual, should have
    2. Architecture Principles - The Guidelines medium level statements, logical, could have
    3. Architecture Guardrails - The non-negotiables low level statements, physical, patterns, must have - non negotiables

Architecture Decision Records - used to drive change to the above - the only way to instigate change. Way of recording, generates a pull request against the architecture
"New <node-type>" - "Update <node-type>"


Domains:
    1. Applications (SPA (3 levels) -> aligned to products)
    2. Data (CDM, LDM, PDM (3 levels))
    3. Integrations (3 levels - captured against the above)
This gives the blueprint - should be able to query this and output reference diagrams or 'views' covering each level.


Store models for content in GitHub?
    - Standard markup? JSON? YAML? Scalable.
    - Ingesting models into EA tooling?
    - What is CALM? | Architecture as Code
Query using AI?
Propose changes?
Iterating the structure around architecture

Using that to then produce architecture content:
    An arch intent. 
    A solution design
    A segment arch
    Reference architectures
    Wiring diagrams
