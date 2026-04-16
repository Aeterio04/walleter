from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List
from datetime import datetime, timedelta
import json
import httpx
import models
import schemas
from database import get_db
from dependencies import get_current_user
from config import get_settings

router = APIRouter(prefix="/insights", tags=["insights"])
settings = get_settings()


def get_insight_limits(plan: str) -> dict:
    """Get insight generation limits based on plan"""
    if plan == "PRO":
        return {"limit": 2, "period_days": 7, "period_name": "week"}
    else:  # FREE
        return {"limit": 3, "period_days": 30, "period_name": "month"}


def count_recent_insights(user_id: str, days: int, db: Session) -> int:
    """Count insights generated in the last N days"""
    cutoff = datetime.utcnow() - timedelta(days=days)
    return db.query(func.count(models.AIInsight.id)).filter(
        models.AIInsight.user_id == user_id,
        models.AIInsight.created_at >= cutoff
    ).scalar() or 0


async def generate_insights_with_grok(user_data: dict) -> List[dict]:
    """Call Grok API to generate insights"""
    if not settings.GROK_API_KEY:
        # Fallback to demo insights if no API key
        return generate_demo_insights(user_data)
    
    prompt = f"""You are a financial insights assistant for a student finance app called Walleter.

Analyze this user's financial data and generate 1-3 actionable insights:

USER DATA:
- Total Income: ₹{user_data['total_credit']}
- Total Expenses: ₹{user_data['total_debit']}
- Balance: ₹{user_data['balance']}
- Category Spending: {json.dumps(user_data['category_spending'])}
- Budget Limits: {json.dumps(user_data['budgets'])}
- Recent Transactions: {user_data['transaction_count']}

RULES:
- Focus on actionable advice for students
- Highlight overspending or budget breaches
- Suggest realistic savings opportunities
- Use Indian Rupee (₹) format
- Be concise and direct
- NO investment advice

Generate 1-3 insights in this JSON format:
[
  {{
    "tag": "SPENDING ALERT" | "BUDGET WARNING" | "SAVINGS TIP" | "SUBSCRIPTION CHECK",
    "headline": "Short impactful headline in UPPERCASE",
    "body": ["Paragraph 1 explaining the issue", "Paragraph 2 with context"],
    "conclusion": "Actionable advice with specific numbers",
    "highlight_stat": "Key number to emphasize (e.g., ₹1,500/month)"
  }}
]

Return ONLY valid JSON array, no other text."""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                settings.GROK_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.GROK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are a financial insights assistant. Return only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1500
                }
            )
            
            if response.status_code != 200:
                print(f"Grok API error: {response.status_code} - {response.text}")
                return generate_demo_insights(user_data)
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Parse JSON from response
            insights = json.loads(content)
            return insights
            
    except Exception as e:
        print(f"Error calling Grok API: {e}")
        return generate_demo_insights(user_data)


def generate_demo_insights(user_data: dict) -> List[dict]:
    """Generate demo insights when API is unavailable"""
    insights = []
    
    # Find top spending category
    if user_data['category_spending']:
        top_cat = max(user_data['category_spending'].items(), key=lambda x: x[1])
        cat_name, cat_spend = top_cat
        
        # Check if over budget
        budget_limit = user_data['budgets'].get(cat_name, 0)
        if budget_limit > 0 and cat_spend > budget_limit * 0.8:
            insights.append({
                "tag": "SPENDING ALERT",
                "headline": f"{cat_name.upper()}: ₹{int(cat_spend)} SPENT THIS MONTH",
                "body": [
                    f"You've spent ₹{int(cat_spend)} on {cat_name} so far. Your budget is ₹{int(budget_limit)}.",
                    "Small daily expenses add up fast. Consider tracking each purchase to identify patterns."
                ],
                "conclusion": f"Try reducing {cat_name} spending by ₹50/day. That's ₹1,500/month saved.",
                "highlight_stat": "₹1,500/month"
            })
    
    # Savings rate insight
    if user_data['total_credit'] > 0:
        savings_rate = ((user_data['total_credit'] - user_data['total_debit']) / user_data['total_credit']) * 100
        insights.append({
            "tag": "SAVINGS TIP",
            "headline": f"YOUR SAVINGS RATE: {int(savings_rate)}%",
            "body": [
                f"Out of ₹{int(user_data['total_credit'])} income, you spent ₹{int(user_data['total_debit'])}.",
                "The 50/30/20 rule suggests saving 20% of income. How does your rate compare?"
            ],
            "conclusion": "Even small improvements compound over time. Aim to increase your savings rate by 5% next month.",
            "highlight_stat": f"{int(savings_rate)}%"
        })
    
    return insights[:3]  # Max 3 insights


@router.post("/generate", response_model=schemas.GenerateInsightResponse)
async def generate_insights(
    request: schemas.GenerateInsightRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI insights based on user's financial data"""
    
    # Check plan limits
    limits = get_insight_limits(current_user.plan)
    recent_count = count_recent_insights(current_user.id, limits["period_days"], db)
    
    if not request.force and recent_count >= limits["limit"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Insight limit reached. {limits['limit']} insights per {limits['period_name']} on {current_user.plan} plan."
        )
    
    # Gather user financial data
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).all()
    
    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id
    ).all()
    
    total_credit = sum(t.amount for t in transactions if t.type == models.TransactionType.CREDIT)
    total_debit = sum(t.amount for t in transactions if t.type == models.TransactionType.DEBIT)
    
    category_spending = {}
    for t in transactions:
        if t.type == models.TransactionType.DEBIT:
            category_spending[t.category] = category_spending.get(t.category, 0) + t.amount
    
    budget_dict = {b.name: b.limit_amount for b in budgets}
    
    user_data = {
        "total_credit": total_credit,
        "total_debit": total_debit,
        "balance": total_credit - total_debit,
        "category_spending": category_spending,
        "budgets": budget_dict,
        "transaction_count": len(transactions)
    }
    
    # Generate insights
    insights = await generate_insights_with_grok(user_data)
    
    # Store in database
    created_count = 0
    for insight_data in insights:
        content = json.dumps({
            "body": insight_data.get("body", []),
            "conclusion": insight_data.get("conclusion", ""),
            "highlight_stat": insight_data.get("highlight_stat", "")
        })
        
        new_insight = models.AIInsight(
            user_id=current_user.id,
            tag=insight_data.get("tag", "INSIGHT"),
            headline=insight_data.get("headline", "Financial Insight"),
            content=content,
            dismissed=False
        )
        db.add(new_insight)
        created_count += 1
    
    db.commit()
    
    remaining = limits["limit"] - (recent_count + created_count)
    
    return {
        "success": True,
        "message": f"Generated {created_count} insights",
        "insights_generated": created_count,
        "remaining_this_period": max(0, remaining)
    }


@router.get("", response_model=List[schemas.AIInsightResponse])
def list_insights(
    include_dismissed: bool = False,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all AI insights for current user"""
    query = db.query(models.AIInsight).filter(models.AIInsight.user_id == current_user.id)
    
    if not include_dismissed:
        query = query.filter(models.AIInsight.dismissed == False)
    
    insights = query.order_by(models.AIInsight.created_at.desc()).all()
    return insights


@router.patch("/{insight_id}/dismiss")
def dismiss_insight(
    insight_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dismiss an insight"""
    insight = db.query(models.AIInsight).filter(
        models.AIInsight.id == insight_id,
        models.AIInsight.user_id == current_user.id
    ).first()
    
    if not insight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insight not found")
    
    insight.dismissed = True
    insight.dismissed_at = datetime.utcnow()
    db.commit()
    
    return {"success": True}


@router.delete("/{insight_id}")
def delete_insight(
    insight_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an insight permanently"""
    insight = db.query(models.AIInsight).filter(
        models.AIInsight.id == insight_id,
        models.AIInsight.user_id == current_user.id
    ).first()
    
    if not insight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insight not found")
    
    db.delete(insight)
    db.commit()
    
    return {"success": True}


@router.get("/limits")
def get_limits(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get insight generation limits for current user"""
    limits = get_insight_limits(current_user.plan)
    recent_count = count_recent_insights(current_user.id, limits["period_days"], db)
    
    return {
        "plan": current_user.plan,
        "limit": limits["limit"],
        "period": limits["period_name"],
        "used": recent_count,
        "remaining": max(0, limits["limit"] - recent_count)
    }
