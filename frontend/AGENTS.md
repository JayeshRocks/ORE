# 🤖 ORE Workspace AI Agents Architecture Blueprint

This document specifies the architecture, data structures, execution pipelines, and backend hook strategies for the autonomous agent matrix within the ORE Workspace ecosystem. Designed for local-first execution, the system targets orchestration over GGUF engine instances via isolated context routing.

---

## 1. System Topology Overview

The ORE Workspace uses a decoupled agent orchestration design. The Next.js frontend acts as an intentional user stream interface, communicating via an asynchronous API layer to local execution workers.

* **User Action / UI Chips** ➔ Trigger custom event handlers on the client page.
* **Next.js API Routes** ➔ Intercept payloads, query local vector databases for contextual embedding context slices, and attach instructions.
* **Local Agent Orchestrator** ➔ Forwards the structured bundle to the target core specialist agent.
* **Local GGUF Pipeline** ➔ KoboldCpp endpoint processes the tokens and streams response metrics back to the UI framework.

---

## 2. Core Agent Archetypes Matrix

The system maps incoming prompts to specific internal agent configurations based on selected modes or prompt profiles:

### Research Assistant Core
* **Primary Objective:** Parse indexed PDF/JSON structural matrices and synthesize grounded responses.
* **Execution Boundary Requirements:** Access to vector document chunks and token indexing states.
* **Base Fallback Prompt Directives:** *“You are an expert technical researcher. Rely strictly on the attached document context vectors. Do not extrapolate.”*

### Technical Teacher Node
* **Primary Objective:** Break down dense technical scripts or engineering architectures into step-by-step primitives.
* **Execution Boundary Requirements:** Sandbox rendering access for markdown visualization frames.
* **Base Fallback Prompt Directives:** *“You are an engineering mentor. Break down algorithmic structures or architectures into high-density conceptual breakdowns.”*

### Code Expert Engine
* **Primary Objective:** Analyze syntax trees, generate runtime-safe solutions, and isolate logic bugs.
* **Execution Boundary Requirements:** Read-only schema boundaries or local environment flags.
* **Base Fallback Prompt Directives:** *“You are a low-level compiler and optimization expert. Generate syntactically clean code with isolated memory management considerations.”*

---

## 3. Local Runtime Orchestration & Backend Hooking

When connecting the Next.js UI workspace files to a live backend handler, developers should look to map inputs using standard data-structure formats.

### 3.1 Prompt Vector Dispatch Payload Schema
When an action is taken inside the UI (such as clicking the suggestions chips or inputting text), the frontend dispatches the following JSON data payload structure to the API route handler:

```json
{
  "session_id": "ore-usr-local-001",
  "agent_profile": "Research Assistant",
  "payload": {
    "user_prompt": "Summarize key operational parameters from Section 3",
    "temperature": 0.2,
    "system_grounding_anchors": [
      {
        "source_file": "research-paper.pdf",
        "vector_chunk_id": "v_idx_42851"
      }
    ]
  }
}