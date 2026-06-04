# Abstraction Layers

Every architecture domain is modelled at three levels of detail. Every artefact type sits at exactly one level.

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

| Layer | Description | Audience |
|---|---|---|
| **Conceptual** | The *what* and *why*. Sets direction and intent — what the architecture needs to achieve and why, without any technology choices. | Business stakeholders and architects aligning on direction |
| **Logical** | The *how*. Defines the rules and principles that guide design decisions, without committing to any specific tool or product. | Architects and senior engineers designing solutions |
| **Physical** | The *where* and *with what*. Specifies the concrete standards and technology decisions that govern how the architecture is built and operated. | Engineers building and operating the architecture |

The layers are progressive: Logical artefacts build on Conceptual ones; Physical artefacts make Logical ones concrete. Relationships that cross layers are captured in **Matrix** artefact types (see [output-formats.md](output-formats.md)).
