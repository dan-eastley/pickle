# Abstraction Layers

Every architecture domain is modelled at three layers of abstraction. Every artefact type lives at exactly one layer.

```mermaid
flowchart TB
    C["<b>Conceptual</b><br/>the <i>what</i> and <i>why</i><br/><sub>business stakeholders<br/>and architects aligning on direction</sub>"]
    L["<b>Logical</b><br/>the <i>how</i><br/><sub>architects and senior engineers<br/>designing solutions</sub>"]
    P["<b>Physical</b><br/>the <i>where</i> and <i>with what</i><br/><sub>engineers building<br/>and operating</sub>"]

    C -- "refined into" --> L
    L -- "made concrete by" --> P

    classDef c fill:#e3f2fd,stroke:#1976d2,color:#000
    classDef l fill:#fff3e0,stroke:#f57c00,color:#000
    classDef p fill:#fce4ec,stroke:#c2185b,color:#000

    class C c
    class L l
    class P p
```

| Layer | Folder | Description | Audience |
|---|---|---|---|
| **Conceptual** | `conceptual/` | The *what* and *why*. Technology-agnostic models that capture intent, scope, and business context. | Business stakeholders and architects aligning on direction |
| **Logical** | `logical/` | The *how*. Vendor-neutral models that define structure, relationships, and rules without committing to specific products or infrastructure. | Architects and senior engineers designing solutions |
| **Physical** | `physical/` | The *where* and *with what*. Concrete, implementation-specific models tied to actual products, platforms, and environments. | Engineers building and operating the architecture |

The layers are progressive: Logical artefact types realise Conceptual ones; Physical artefact types realise Logical ones. Cross-layer relationships are captured in **Matrix** artefact types (see [output-formats.md](output-formats.md)).
