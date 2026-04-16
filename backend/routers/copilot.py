from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional, TypedDict
from datetime import datetime
import json
import re
import httpx
import models
import schemas
from database import get_db
from dependencies import get_current_user
from config import get_settings

# LangGraph imports
from langgraph.graph import StateGraph, END

router = APIRouter(prefix="/copilot", tags=["copilot"])
settings = get_settings()

# Initialize Groq client
GROQ_API_KEY = settings.GROK_API_KEY
GROQ_API_URL = settings.GROK_API_URL

print(f"[copilot] Groq API Key: {'SET ✓' if GROQ_API_KEY else 'NOT SET ✗'}")
print(f"[copilot] Groq API URL: {GROQ_API_URL}")


# ── State Definition ─────────────────────────────────────

class CopilotState(TypedDict):
    """State that flows through the LangGraph"""
    user_input: str
    user_id: str
    db: Any  # SQLAlchemy session
    
    # Intent classification
    domain: Optional[str]
    action: Optional[str]
    transaction_type: Optional[str]  # "credit" or "debit"
    confidence: float
    
    # Entity extraction
    amount: Optional[float]
    category: Optional[str]
    description: Optional[str]
    missing_entities: List[str]
    
    # Response
    response_type: str
    response_message: str
    response_data: Optional[Dict]
    response_actions: List[Dict]
    
    # Error handling
    error: Optional[str]


# ── LLM-Based Intent Classification ─────────────────────

async def classify_intent_with_llm(user_input: str) -> Dict[str, Any]:
    """
    Use Groq LLM to classify intent
    """
    prompt = f"""You are a financial assistant. Analyze this user input and extract:
1. domain: "expenses", "budgets", "investments", or "general"
2. action: "add", "update", "delete", or "view"
3. transaction_type: "credit" (money in) or "debit" (money out)

User input: "{user_input}"

Rules:
- If user mentions spending, paying, buying, cost → domain="expenses", action="add", transaction_type="debit"
- If user mentions receiving, got from someone, salary, income → domain="expenses", action="add", transaction_type="credit"
- If user mentions budget, limit → domain="budgets"
- If user mentions set/create budget → action="add"
- If user mentions change/update/increase/decrease budget → action="update"
- If user mentions remove/delete budget → action="delete"
- If user mentions show/view → action="view"

Examples:
- "my car broke down, it cost 388" → {{"domain": "expenses", "action": "add", "transaction_type": "debit"}}
- "got lunch for 300" → {{"domain": "expenses", "action": "add", "transaction_type": "debit"}}
- "dad sent me 500" → {{"domain": "expenses", "action": "add", "transaction_type": "credit"}}
- "set food budget to 3000" → {{"domain": "budgets", "action": "add", "transaction_type": null}}
- "change food budget to 5000" → {{"domain": "budgets", "action": "update", "transaction_type": null}}

Respond ONLY with valid JSON:
{{"domain": "expenses", "action": "add", "transaction_type": "debit"}}"""

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are a financial assistant. Extract intent from user input. Return only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 100
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Groq API error: {response.status_code}")
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Parse JSON
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            data = json.loads(content)
            return {
                "domain": data.get("domain", "general"),
                "action": data.get("action", "view"),
                "transaction_type": data.get("transaction_type"),
                "confidence": 0.95
            }
            
    except Exception as e:
        print(f"[classify_intent_with_llm] Groq failed: {e}")
        # Fallback to simple rules
        return classify_intent_fallback(user_input)


def classify_intent_fallback(user_input: str) -> Dict[str, Any]:
    """Fallback if LLM fails"""
    lower = user_input.lower()
    
    domain = "expenses"
    action = "add"
    transaction_type = "debit"
    
    if "budget" in lower:
        domain = "budgets"
        if "change" in lower or "update" in lower or "increase" in lower or "decrease" in lower:
            action = "update"
        elif "remove" in lower or "delete" in lower:
            action = "delete"
        else:
            action = "add"
        transaction_type = None
    elif "show" in lower or "view" in lower or "see" in lower:
        action = "view"
    
    # Check if income
    if any(phrase in lower for phrase in ["sent me", "gave me", "received from", "got salary", "got payment"]):
        transaction_type = "credit"
    
    return {
        "domain": domain,
        "action": action,
        "transaction_type": transaction_type,
        "confidence": 0.7
    }


async def classify_intent(state: CopilotState) -> CopilotState:
    """
    Node 1: Classify user intent using Groq LLM
    """
    user_input = state["user_input"]
    
    if GROQ_API_KEY:
        intent = await classify_intent_with_llm(user_input)
    else:
        print("[classify_intent] No Groq API key, using fallback")
        intent = classify_intent_fallback(user_input)
    
    state["domain"] = intent["domain"]
    state["action"] = intent["action"]
    state["transaction_type"] = intent["transaction_type"]
    state["confidence"] = intent["confidence"]
    
    print(f"[classify_intent] domain={intent['domain']}, action={intent['action']}, transaction_type={intent['transaction_type']}")
    return state


# ── Node 2: Entity Extraction with LLM ──────────────────

async def extract_entities_with_llm(state: CopilotState) -> CopilotState:
    """
    Node 2: Extract entities using Groq LLM
    """
    user_input = state["user_input"]
    domain = state["domain"]
    transaction_type = state["transaction_type"]
    
    # Initialize
    state["amount"] = None
    state["category"] = None
    state["description"] = None
    state["missing_entities"] = []
    
    # Only extract for expenses and budgets
    if domain not in ["expenses", "budgets"]:
        return state
    
    # Extract amount using regex (fast and reliable)
    amount_patterns = [
        r'₹\s*(\d+(?:\.\d+)?)',
        r'rs\.?\s*(\d+(?:\.\d+)?)',
        r'rupees?\s*(\d+(?:\.\d+)?)',
        r'\b(\d+(?:\.\d+)?)\s*(?:rupees?|rs|₹)',
        r'\b(\d+(?:\.\d+)?)\b'
    ]
    
    for pattern in amount_patterns:
        match = re.search(pattern, user_input, re.IGNORECASE)
        if match:
            state["amount"] = float(match.group(1))
            break
    
    # Use Groq to extract category and description
    if GROQ_API_KEY and state["amount"]:
        try:
            result = await extract_with_groq(user_input, state["amount"], transaction_type)
            state["category"] = result["category"]
            state["description"] = result["description"]
            print(f"[extract_entities_with_llm] Groq: category={result['category']}, description={result['description']}")
        except Exception as e:
            print(f"[extract_entities_with_llm] Groq failed: {e}, using fallback")
            state = extract_entities_fallback(state, transaction_type)
    else:
        print(f"[extract_entities_with_llm] No Groq or no amount, using fallback")
        state = extract_entities_fallback(state, transaction_type)
    
    # Always default to "Others" if no category
    if not state["category"]:
        state["category"] = "Others"
    
    # Check missing (only amount)
    if state["action"] in ["add", "delete", "update"]:
        if state["amount"] is None:
            state["missing_entities"].append("amount")
    
    print(f"[extract_entities_with_llm] Final: amount={state['amount']}, category={state['category']}, description={state['description']}")
    return state


async def extract_with_groq(user_input: str, amount: float, transaction_type: str) -> Dict[str, str]:
    """Extract category and description using Groq"""
    
    categories = ["Food", "Transport", "Stationery", "Entertainment", "Subscriptions", "Investment", "Others"]
    tx_type = "expense (money out)" if transaction_type == "debit" else "income (money in)"
    
    prompt = f"""Extract category and description from this financial transaction.

Input: "{user_input}"
Amount: ₹{amount}

Categories: {", ".join(categories)}

Rules for CATEGORY:
- lunch, dinner, coffee, food, restaurant → Food
- uber, cab, taxi, car, transport, petrol → Transport  
- pen, notebook, stationery, books → Stationery
- movie, game, entertainment, concert → Entertainment
- netflix, spotify, gym, membership, subscription → Subscriptions
- stocks, mutual fund, investment → Investment
- If unclear → Others

Rules for DESCRIPTION:
- Natural 2-5 words
- Capitalize properly
- Be specific

Examples:
- "my car broke down, it cost 388" → {{"category": "Transport", "description": "Car repair"}}
- "got lunch for 300" → {{"category": "Food", "description": "Lunch"}}
- "add budget for 4000 at the gym" → {{"category": "Subscriptions", "description": "Gym membership"}}
- "set food budget to 3000" → {{"category": "Food", "description": "Food budget"}}
- "dad sent me 500" → {{"category": "Others", "description": "Received from Dad"}}

JSON only:
{{"category": "Food", "description": "Lunch"}}"""

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": "Extract category and description. Return only JSON."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
                "max_tokens": 100
            }
        )
        
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        data = json.loads(content)
        
        category = data.get("category", "Others")
        if category not in categories:
            category = "Others"
        
        return {
            "category": category,
            "description": data.get("description", "Transaction")
        }


def extract_entities_fallback(state: CopilotState, transaction_type: str) -> CopilotState:
    """Fallback extraction"""
    user_input = state["user_input"].lower()
    
    # Category keywords
    if any(w in user_input for w in ["lunch", "dinner", "food", "coffee", "meal", "restaurant"]):
        state["category"] = "Food"
    elif any(w in user_input for w in ["uber", "cab", "taxi", "car", "transport", "petrol", "fuel"]):
        state["category"] = "Transport"
    elif any(w in user_input for w in ["pen", "notebook", "stationery", "book"]):
        state["category"] = "Stationery"
    elif any(w in user_input for w in ["movie", "game", "entertainment", "concert"]):
        state["category"] = "Entertainment"
    elif any(w in user_input for w in ["netflix", "spotify", "subscription", "gym", "membership"]):
        state["category"] = "Subscriptions"
    elif any(w in user_input for w in ["stock", "mutual fund", "investment"]):
        state["category"] = "Investment"
    else:
        state["category"] = "Others"
    
    # Description
    desc = state["user_input"]
    if state["amount"]:
        desc = re.sub(r'\d+', '', desc)
        desc = re.sub(r'[₹rs\.]', '', desc, flags=re.IGNORECASE)
    
    for word in ["add", "spent", "paid", "bought", "got", "for", "cost", "it", "my", "budget", "set", "at", "the"]:
        desc = desc.replace(f" {word} ", " ")
    
    desc = ' '.join(desc.split()).strip()
    state["description"] = desc.capitalize() if desc else "Transaction"
    
    return state


# ── Node 3: Route Decision ──────────────────────────────

def should_request_info(state: CopilotState) -> str:
    """
    Conditional edge: Decide if we need more info or can execute
    """
    print(f"[should_request_info] action={state['action']}, missing={state['missing_entities']}")
    
    # If it's a view or help action, go straight to execution
    if state["action"] in ["view", "help"]:
        return "execute"
    
    # If we have missing entities for add/delete, request info
    if state["action"] in ["add", "delete"] and state["missing_entities"]:
        return "request_info"
    
    # Otherwise, execute
    return "execute"


# ── Node 4: Request Missing Info ────────────────────────

def request_missing_info(state: CopilotState) -> CopilotState:
    """
    Node 4: Generate response requesting missing information (only amount)
    """
    domain = state["domain"]
    action = state["action"]
    missing = state["missing_entities"]
    
    print(f"[request_missing_info] domain={domain}, action={action}, missing={missing}")
    
    if domain == "expenses" and action == "add":
        message = "UNDERSTOOD. I can help you add a transaction.\n\nPlease provide the amount.\n\nExample: '100 for lunch' or 'Dad sent me 500'"
        
        state["response_type"] = "request_info"
        state["response_message"] = message
        state["response_actions"] = [{"label": "OPEN EXPENSES", "type": "navigate", "data": "/expenses"}]
    
    elif domain == "budgets" and action == "add":
        message = "I can help you create a budget.\n\nPlease provide the monthly limit amount.\n\nExample: 'Set Food budget to ₹3000'"
        
        state["response_type"] = "request_info"
        state["response_message"] = message
        state["response_actions"] = [{"label": "MANAGE BUDGETS", "type": "navigate", "data": "/budget"}]
    
    elif domain == "budgets" and action == "delete":
        state["response_type"] = "request_info"
        state["response_message"] = "Which budget would you like to remove? Please specify the category."
        state["response_actions"] = [{"label": "MANAGE BUDGETS", "type": "navigate", "data": "/budget"}]
    
    else:
        state["response_type"] = "request_info"
        state["response_message"] = "I need more information to complete this action."
        state["response_actions"] = []
    
    state["response_data"] = {"missing": missing}
    return state


# ── Node 5: Execute Action ──────────────────────────────

def execute_action(state: CopilotState) -> CopilotState:
    """
    Node 5: Execute the actual action based on intent and entities
    """
    domain = state["domain"]
    action = state["action"]
    db = state["db"]
    user_id = state["user_id"]
    
    print(f"[execute_action] domain={domain}, action={action}, amount={state['amount']}, category={state['category']}")
    
    try:
        # Handle help
        if action == "help":
            state["response_type"] = "info"
            state["response_message"] = """CO-PILOT CAPABILITIES:

✓ EXPENSES (Money Out)
  • "Spent 100 on lunch" → Auto-detects Food
  • "Paid 50 for uber" → Auto-detects Transport
  • "Add 200 for netflix" → Auto-detects Subscriptions

✓ INCOME (Money In)
  • "Dad sent me 500" → Records income
  • "Got 1000 salary" → Records income
  • "Received 200 from friend" → Records income

✓ BUDGETS
  • "Set Food budget to ₹3000"
  • "Show my budgets"
  • "Remove Transport budget"

✓ INVESTMENTS
  • "Show my portfolio" (view only)

✗ NO INVESTMENT ADVICE PROVIDED

Try: "Spent 100 on lunch" or "Dad sent me 500"!"""
            state["response_actions"] = []
            return state
        
        # Handle view actions
        if action == "view":
            routes = {
                "expenses": "/expenses",
                "budgets": "/budget",
                "investments": "/investments",
                "general": "/dashboard"
            }
            messages = {
                "expenses": "Opening your expense tracker...",
                "budgets": "Opening budget management...",
                "investments": "Opening your investment portfolio...",
                "general": "Opening dashboard..."
            }
            
            state["response_type"] = "navigate"
            state["response_message"] = messages.get(domain, "Opening...")
            state["response_actions"] = [{"label": f"OPEN {domain.upper()}", "type": "navigate", "data": routes.get(domain)}]
            return state
        
        # Block investment modifications
        if domain == "investments" and action in ["add", "delete"]:
            state["response_type"] = "error"
            state["response_message"] = "⚠ INVESTMENT MODIFICATIONS NOT SUPPORTED\n\nI cannot add or modify investments through the copilot. You can view your portfolio, but changes must be made manually.\n\nFor investment advice, consult a SEBI-registered financial advisor."
            state["response_actions"] = [{"label": "VIEW PORTFOLIO", "type": "navigate", "data": "/investments"}]
            return state
        
        # Execute add expense
        if domain == "expenses" and action == "add":
            transaction_type_enum = models.TransactionType.CREDIT if state["transaction_type"] == "credit" else models.TransactionType.DEBIT
            transaction_label = "INCOME" if state["transaction_type"] == "credit" else "EXPENSE"
            
            print(f"[execute_action] Creating transaction: amount={state['amount']}, category={state['category']}, description={state['description']}, type={transaction_type_enum}")
            
            new_transaction = models.Transaction(
                user_id=user_id,
                date=datetime.utcnow().date(),
                description=state["description"],
                amount=state["amount"],
                category=state["category"],
                type=transaction_type_enum
            )
            db.add(new_transaction)
            db.commit()
            db.refresh(new_transaction)
            
            print(f"[execute_action] Transaction created: id={new_transaction.id}")
            
            state["response_type"] = "success"
            state["response_message"] = f"✓ {transaction_label} ADDED\n\n₹{state['amount']} • {state['category']}\n{state['description']}\n\nTransaction recorded successfully."
            state["response_data"] = {"transaction_id": new_transaction.id}
            state["response_actions"] = [{"label": "VIEW EXPENSES", "type": "navigate", "data": "/expenses"}]
            return state
        
        # Execute add/update budget
        if domain == "budgets" and action == "add":
            # Check if category was detected
            if not state["category"] or state["category"] == "Others":
                state["response_type"] = "error"
                state["response_message"] = "Please specify a valid budget category (Food, Transport, Stationery, Entertainment, Subscriptions, Investment)."
                state["response_actions"] = [{"label": "MANAGE BUDGETS", "type": "navigate", "data": "/budget"}]
                return state
            
            existing = db.query(models.Budget).filter(
                models.Budget.user_id == user_id,
                models.Budget.name == state["category"]
            ).first()
            
            if existing:
                existing.limit_amount = state["amount"]
                db.commit()
                message = f"✓ BUDGET UPDATED\n\n{state['category']}: ₹{state['amount']}/month\n\nBudget limit updated successfully."
            else:
                icon_map = {
                    "Food": "🍔", "Transport": "🚗", "Stationery": "📝",
                    "Entertainment": "🎮", "Subscriptions": "📱", "Investment": "💰"
                }
                icon = icon_map.get(state["category"], "💵")
                
                new_budget = models.Budget(
                    user_id=user_id,
                    name=state["category"],
                    icon=icon,
                    limit_amount=state["amount"],
                    locked=False
                )
                db.add(new_budget)
                db.commit()
                message = f"✓ BUDGET CREATED\n\n{state['category']}: ₹{state['amount']}/month\n\nBudget created successfully."
            
            state["response_type"] = "success"
            state["response_message"] = message
            state["response_actions"] = [{"label": "VIEW BUDGETS", "type": "navigate", "data": "/budget"}]
            return state
        
        # Execute update budget (change existing budget amount)
        if domain == "budgets" and action == "update":
            if not state["category"] or state["category"] == "Others":
                state["response_type"] = "error"
                state["response_message"] = "Please specify which budget category you want to update (Food, Transport, etc.)."
                state["response_actions"] = [{"label": "MANAGE BUDGETS", "type": "navigate", "data": "/budget"}]
                return state
            
            existing = db.query(models.Budget).filter(
                models.Budget.user_id == user_id,
                models.Budget.name == state["category"]
            ).first()
            
            if not existing:
                state["response_type"] = "error"
                state["response_message"] = f"Budget '{state['category']}' not found. Would you like to create it?"
                state["response_actions"] = [{"label": "CREATE BUDGET", "type": "navigate", "data": "/budget"}]
                return state
            
            old_amount = existing.limit_amount
            existing.limit_amount = state["amount"]
            db.commit()
            
            state["response_type"] = "success"
            state["response_message"] = f"✓ BUDGET UPDATED\n\n{state['category']}: ₹{old_amount} → ₹{state['amount']}/month\n\nBudget limit changed successfully."
            state["response_actions"] = [{"label": "VIEW BUDGETS", "type": "navigate", "data": "/budget"}]
            return state
        
        # Execute delete budget
        if domain == "budgets" and action == "delete":
            if not state["category"] or state["category"] == "Others":
                state["response_type"] = "error"
                state["response_message"] = "Please specify which budget category you want to remove (Food, Transport, etc.)."
                state["response_actions"] = [{"label": "VIEW BUDGETS", "type": "navigate", "data": "/budget"}]
                return state
            
            budget = db.query(models.Budget).filter(
                models.Budget.user_id == user_id,
                models.Budget.name == state["category"]
            ).first()
            
            if not budget:
                state["response_type"] = "error"
                state["response_message"] = f"Budget '{state['category']}' not found."
                state["response_actions"] = [{"label": "VIEW BUDGETS", "type": "navigate", "data": "/budget"}]
                return state
            
            db.delete(budget)
            db.commit()
            
            state["response_type"] = "success"
            state["response_message"] = f"✓ BUDGET REMOVED\n\n{state['category']} budget has been deleted."
            state["response_actions"] = [{"label": "VIEW BUDGETS", "type": "navigate", "data": "/budget"}]
            return state
        
        # Execute delete expense (placeholder)
        if domain == "expenses" and action == "delete":
            state["response_type"] = "info"
            state["response_message"] = "To delete an expense, please open the Expenses page and select the transaction you want to remove."
            state["response_actions"] = [{"label": "OPEN EXPENSES", "type": "navigate", "data": "/expenses"}]
            return state
        
        # Default fallback
        state["response_type"] = "info"
        state["response_message"] = "I'm not sure how to help with that. Try:\n• 'Add 100 for lunch'\n• 'Show my budgets'\n\nType 'help' for more options."
        state["response_actions"] = [{"label": "HELP", "type": "help"}]
        return state
    
    except Exception as e:
        print(f"[execute_action] ERROR: {e}")
        import traceback
        traceback.print_exc()
        
        state["response_type"] = "error"
        state["response_message"] = f"An error occurred: {str(e)}"
        state["response_actions"] = []
        state["error"] = str(e)
        return state


# ── Build LangGraph ─────────────────────────────────────

def build_copilot_graph() -> StateGraph:
    """
    Build the LangGraph workflow with async support
    """
    workflow = StateGraph(CopilotState)
    
    # Add nodes
    workflow.add_node("classify_intent", classify_intent)
    workflow.add_node("extract_entities", extract_entities_with_llm)
    workflow.add_node("request_missing_info", request_missing_info)
    workflow.add_node("execute_action", execute_action)
    
    # Add edges
    workflow.set_entry_point("classify_intent")
    workflow.add_edge("classify_intent", "extract_entities")
    
    # Conditional edge based on missing entities
    workflow.add_conditional_edges(
        "extract_entities",
        should_request_info,
        {
            "request_info": "request_missing_info",
            "execute": "execute_action"
        }
    )
    
    # Terminal edges
    workflow.add_edge("request_missing_info", END)
    workflow.add_edge("execute_action", END)
    
    return workflow.compile()


# ── API Endpoint ─────────────────────────────────────────

# Build graph once at module level
copilot_graph = build_copilot_graph()


@router.post("/chat")
async def chat(
    request: schemas.CopilotChatRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Main copilot chat endpoint using LangGraph with Grok integration
    """
    
    try:
        print(f"\n[chat] User input: {request.message}")
        
        # Initialize state
        initial_state: CopilotState = {
            "user_input": request.message,
            "user_id": current_user.id,
            "db": db,
            "domain": None,
            "action": None,
            "transaction_type": None,
            "confidence": 0.0,
            "amount": None,
            "category": None,
            "description": None,
            "missing_entities": [],
            "response_type": "",
            "response_message": "",
            "response_data": None,
            "response_actions": [],
            "error": None
        }
        
        # Run the graph
        final_state = await copilot_graph.ainvoke(initial_state)
        
        print(f"[chat] Final state: response_type={final_state['response_type']}, message={final_state['response_message'][:50]}...")
        
        # Build response
        return {
            "success": True,
            "intent": {
                "domain": final_state["domain"],
                "action": final_state["action"],
                "confidence": final_state["confidence"],
                "raw_input": request.message
            },
            "entities": {
                "amount": final_state["amount"],
                "category": final_state["category"],
                "description": final_state["description"],
                "missing": final_state["missing_entities"]
            },
            "response": {
                "type": final_state["response_type"],
                "message": final_state["response_message"],
                "data": final_state["response_data"],
                "actions": final_state["response_actions"]
            }
        }
    
    except Exception as e:
        print(f"[chat] ERROR: {e}")
        import traceback
        traceback.print_exc()
        
        return {
            "success": False,
            "error": str(e),
            "response": {
                "type": "error",
                "message": f"An error occurred processing your request: {str(e)}",
                "data": None,
                "actions": []
            }
        }


@router.get("/graph")
async def get_graph_structure():
    """
    Debug endpoint: Get the graph structure visualization
    """
    try:
        mermaid = copilot_graph.get_graph().draw_mermaid()
        return {
            "success": True,
            "graph_type": "LangGraph StateGraph with Grok Integration",
            "mermaid": mermaid,
            "nodes": ["classify_intent", "extract_entities (with Grok)", "request_missing_info", "execute_action"],
            "features": [
                "Intelligent category detection using Grok API",
                "Fallback to rule-based extraction",
                "Automatic description extraction",
                "Conditional routing based on missing entities"
            ]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
