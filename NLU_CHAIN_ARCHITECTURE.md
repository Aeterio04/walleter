# LangGraph NLU Architecture - Walleter Copilot

## Overview
The Walleter Copilot uses **LangGraph** to implement a stateful, graph-based NLU workflow. This allows for complex multi-agent interactions with conditional routing and easy extensibility.

## Why LangGraph?

- **Stateful**: Maintains state across nodes
- **Conditional Routing**: Dynamic flow based on extracted data
- **Extensible**: Easy to add new nodes and edges
- **Debuggable**: Built-in visualization and state inspection
- **Production-Ready**: Handles errors, retries, and complex workflows

---

## Graph Architecture

```
                    START
                      ↓
            ┌─────────────────┐
            │ classify_intent │  (Node 1: Determine domain & action)
            └─────────────────┘
                      ↓
            ┌─────────────────┐
            │ extract_entities│  (Node 2: Extract amount, category, etc.)
            └─────────────────┘
                      ↓
                [Conditional Edge]
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
┌──────────────────┐      ┌─────────────────┐
│request_mis execute_action  │
│     _info        │      │                 │
└──────────────────┘      └─────────────────┘
        ↓                           ↓
       END                         END
```

---

## State Definition

The `CopilotState` flows through all nodes:

```python
class CopilotState(TypedDict):
    # Input
    user_input: str
    user_id: str
    db: Any
    
    # Intent (from Node 1)
    domain: Optional[str]        # expenses, budgets, investments
    action: Optional[str]        # add, delete, view, help
    confidence: float
    
    # Entities (from Node 2)
    amount: Optional[float]
    category: Optional[str]
    description: Optional[str]
st[str]
    
    # Response (from Node 4/5)
    response_type: str
    response_message: str
    response_data: Optional[Dict]
    response_actions: List[Dict]
    
    # Error handling
    error: Optional[str]
```

---

## Nodes

### Node 1: `classify_intent`
**Purpose**: Classify user intent into domain and action

**Input**: `user_input`

**Output**: Updates `domain`, `action`, `confidence`

**Logic**:
- Keyword matching for domain detection
- Action verb detection
- Confidence scoring

**Example**:
```python
Input: "Add ₹150 for lunch"
Output: {domain: "expenses", action: "add", confidence: 0.85}
```

---

### Node 2: `extract_entities`
**Purpose**: Extract structured data from user input

**Input**: `user_input`, `domain`, `action`

**Output**: Updates `amount`, `category`, `description`, `missing_entities`

**Logic**:
- Regex-based amount extraction (₹150, Rs 150, etc.)
- Category matching against predefined list
- Description extraction by removing amount/category
- Missing entity detection

**Example**:
```python
Input: "Add ₹150 for lunch in Food"
Output: {
    amount: 150,
    category: "Food",
    description: "lunch",
    missing_entities: []
}
```

---

### Conditional Edge: `should_request_info`
**Purpose**: Route to appropriate next node

**Logic**:
```python
if action in ["view", "help"]:
    return "execute"
elif action in ["add", "delete"] and missing_entities:
    return "request_info"
else:
    return "execute"
```

**Routes**:
- `request_info` → Node 4 (request missing information)
- `execute` → Node 5 (execute action)

---

### Node 4: `request_missing_info`
**Purpose**: Generate response asking for missing data

**Input**: `domain`, `action`, `missing_entities`

**Output**: Updates `response_type`, `response_message`, `response_actions`

**Example**:
```python
Input: {domain: "expenses", action: "add", missing: ["amount", "category"]}
Output: {
    response_type: "request_info",
    response_message: "Please provide:\n• Amount (₹)\n• Category...",
    response_actions:}]
}
```

---

### Node 5: `execute_action`
**Purpose**: Execute the actual database operation or navigation

**Input**: All state fields

**Output**: Updates `response_type`, `response_message`, `response_data`, `response_actions`

**Actions**:
- **View**: Navigate to panel
- **Add Expense**: Create transaction in DB
- **Add Budget**: Create/update budget in DB
- **Delete Budget**: Remove budget from DB
- **Help**: Return capabilities list
- **Investment Add/Delete**: Block with error message

**Example**:
ms |
| Error Handling | Try/catch | Node-level |
| Parallel Execution | Manual | Built-in |
| Loops/Cycles | Complex | Natural |

---

## Installation

```bash
pip install langgraph langchain-core
```

Or add to `requirements.txt`:
```
langgraph==0.2.28
langchain-core==0.3.10
```
pilotState:
    llm = ChatOpenAI(model="gpt-4")
    result = llm.invoke(f"Classify intent: {state['user_input']}")
    # Parse and update state
    return state
```

---

## Advantages Over Simple Chain

| Feature | Simple Chain | LangGraph |
|---------|-------------|-----------|
| State Management | Manual passing | Built-in |
| Conditional Routing | If/else | Graph edges |
| Extensibility | Refactor needed | Add nodes |
| Debugging | Print statements | State inspection |
| Visualization | None | Mermaid diagra_user_action)
workflow.add_edge("execute_action", "log_analytics")
workflow.add_edge("log_analytics", END)
```

### 4. Multi-turn Dialog
Add a loop for follow-up questions:
```python
workflow.add_conditional_edges(
    "execute_action",
    needs_followup,
    {
        "continue": "classify_intent",  # Loop back
        "done": END
    }
)
```

### 5. LLM Integration
Replace rule-based nodes with LLM calls:
```python
from langchain_openai import ChatOpenAI

def llm_classify_intent(state: CopilotState) -> Coation history:
```python
workflow.add_node("load_context", load_conversation_context)
workflow.set_entry_point("load_context")
workflow.add_edge("load_context", "classify_intent")
```

### 2. Validation Node
Add validation before execution:
```python
workflow.add_node("validate", validate_entities)
workflow.add_edge("extract_entities", "validate")
workflow.add_conditional_edges("validate", check_valid, {...})
```

### 3. Analytics Node
Add post-execution analytics:
```python
workflow.add_node("log_analytics", log_node", new_node)
workflow.add_edge("extract_entities", "new_node")
workflow.add_edge("new_node", "execute_action")
```

### Adding Conditional Logic

```python
def route_decision(state: CopilotState) -> str:
    if state["some_condition"]:
        return "path_a"
    return "path_b"

workflow.add_conditional_edges(
    "source_node",
    route_decision,
    {
        "path_a": "node_a",
        "path_b": "node_b"
    }
)
```

---

## Future Enhancements

### 1. Context Memory Node
Add a node to maintain convers": "..."},
    "actions": [...]
  }
}
```

### GET `/copilot/graph`
Debug endpoint to visualize graph structure

**Response**:
```json
{
  "success": true,
  "graph_type": "LangGraph StateGraph",
  "mermaid": "graph TD\n  START --> classify_intent...",
  "nodes": [...],
  "edges": [...]
}
```

---

## Extending the Graph

### Adding a New Node

```python
def new_node(state: CopilotState) -> CopilotState:
    # Process state
    state["new_field"] = "value"
    return state

# Add to graph
workflow.add_node("new`/copilot/chat`
Main chat endpoint

**Request**:
```json
{
  "message": "Add ₹150 for lunch in Food category"
}
```

**Response**:
```json
{
  "success": true,
  "intent": {
    "domain": "expenses",
    "action": "add",
    "confidence": 0.85,
    "raw_input": "Add ₹150 for lunch in Food category"
  },
  "entities": {
    "amount": 150,
    "category": "Food",
    "description": "lunch",
    "missing": []
  },
  "response": {
    "type": "success",
    "message": "✓ EXPENSE ADDED...",
    "data": {"transaction_id 4 (request_missing_info):
  → response_type: "request_info"
  → response_message: "Please provide: Amount, Category..."
  → END
```

### Example 3: View Action
```
User: "Show my expenses"

Node 1 (classify_intent):
  → domain: "expenses", action: "view"

Node 2 (extract_entities):
  → (skipped, not needed for view)

Conditional Edge:
  → Route to "execute" (view action)

Node 5 (execute_action):
  → response_type: "navigate"
  → response_data: {route: "/expenses"}
  → END
```

---

## API Endpoints

### POST cription: "lunch"
  → missing_entities: []

Conditional Edge:
  → Route to "execute" (no missing entities)

Node 5 (execute_action):
  → Create transaction in DB
  → response_type: "success"
  → END
```

### Example 2: Missing Information
```
User: "Add an expense"

Node 1 (classify_intent):
  → domain: "expenses", action: "add"

Node 2 (extract_entities):
  → amount: None, category: None
  → missing_entities: ["amount", "category"]

Conditional Edge:
  → Route to "request_info" (has missing entities)

Nodeon
Input: {domain: "expenses", action: "add", amount: 150, category: "Food"}
Output: {
    response_type: "success",
    response_message: "✓ EXPENSE ADDED\n\n₹150 • Food...",
    response_data: {"transaction_id": "..."},
    response_actions: [{"label": "VIEW EXPENSES", ...}]
}
```

---

## Flow Examples

### Example 1: Complete Add Expense
```
User: "Add ₹150 for lunch in Food"

Node 1 (classify_intent):
  → domain: "expenses", action: "add"

Node 2 (extract_entities):
  → amount: 150, category: "Food", des```pyth