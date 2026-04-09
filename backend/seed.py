from datetime import date, timedelta
from database import SessionLocal
from models import Base, engine
from auth import get_password_hash
import models

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Clear existing data
db.query(models.Investment).delete()
db.query(models.Budget).delete()
db.query(models.Transaction).delete()
db.query(models.RefreshToken).delete()
db.query(models.User).delete()
db.commit()

# Create demo user
demo_user = models.User(
    email="demo@walleter.app",
    name="Demo Student",
    password_hash=get_password_hash("demo123"),
    plan=models.PlanType.FREE,
    emergency_fund=3000.0,
    emergency_target=15000.0
)
db.add(demo_user)
db.commit()
db.refresh(demo_user)

print(f"✓ Created demo user: {demo_user.email}")

# Seed transactions
transactions_data = [
    {"date": date.today() - timedelta(days=25), "description": "Pocket Money", "amount": 3000, "category": "Income", "type": "credit"},
    {"date": date.today() - timedelta(days=24), "description": "Canteen Lunch", "amount": 80, "category": "Food", "type": "debit"},
    {"date": date.today() - timedelta(days=23), "description": "Bus Pass", "amount": 250, "category": "Transport", "type": "debit"},
    {"date": date.today() - timedelta(days=22), "description": "Notebooks & Pens", "amount": 180, "category": "Stationery", "type": "debit"},
    {"date": date.today() - timedelta(days=20), "description": "Movie Ticket", "amount": 200, "category": "Entertainment", "type": "debit"},
    {"date": date.today() - timedelta(days=18), "description": "Freelance Gig", "amount": 2000, "category": "Income", "type": "credit"},
    {"date": date.today() - timedelta(days=15), "description": "Spotify Premium", "amount": 119, "category": "Subscriptions", "type": "debit"},
    {"date": date.today() - timedelta(days=14), "description": "Street Food", "amount": 150, "category": "Food", "type": "debit"},
    {"date": date.today() - timedelta(days=12), "description": "Auto Rickshaw", "amount": 60, "category": "Transport", "type": "debit"},
    {"date": date.today() - timedelta(days=10), "description": "Scholarship", "amount": 5000, "category": "Income", "type": "credit"},
    {"date": date.today() - timedelta(days=8), "description": "Textbooks", "amount": 450, "category": "Stationery", "type": "debit"},
    {"date": date.today() - timedelta(days=6), "description": "Cafe Hangout", "amount": 320, "category": "Food", "type": "debit"},
    {"date": date.today() - timedelta(days=4), "description": "Netflix", "amount": 199, "category": "Subscriptions", "type": "debit"},
    {"date": date.today() - timedelta(days=3), "description": "Gaming", "amount": 500, "category": "Entertainment", "type": "debit"},
    {"date": date.today() - timedelta(days=1), "description": "Mutual Fund SIP", "amount": 1000, "category": "Investment", "type": "debit"},
]

for txn_data in transactions_data:
    txn = models.Transaction(user_id=demo_user.id, **txn_data)
    db.add(txn)

db.commit()
print(f"✓ Created {len(transactions_data)} transactions")

# Seed budgets
budgets_data = [
    {"name": "Food", "icon": "🍔", "limit_amount": 3000, "locked": False},
    {"name": "Transport", "icon": "🚌", "limit_amount": 1500, "locked": False},
    {"name": "Stationery", "icon": "📚", "limit_amount": 800, "locked": False},
    {"name": "Entertainment", "icon": "🎮", "limit_amount": 1000, "locked": False},
    {"name": "Subscriptions", "icon": "📱", "limit_amount": 500, "locked": True},
    {"name": "Investment", "icon": "💰", "limit_amount": 1000, "locked": False},
]

for budget_data in budgets_data:
    budget = models.Budget(user_id=demo_user.id, **budget_data)
    db.add(budget)

db.commit()
print(f"✓ Created {len(budgets_data)} budget categories")

# Seed investments
investments_data = [
    {"name": "SBI Bluechip Fund", "type": "Mutual Fund", "value": 5000, "notes": "Monthly SIP ₹500", "date_added": date.today() - timedelta(days=180)},
    {"name": "Digital Gold", "type": "Gold", "value": 2000, "notes": "Safe haven asset", "date_added": date.today() - timedelta(days=120)},
    {"name": "Zerodha Stocks", "type": "Stocks", "value": 3500, "notes": "Tech stocks portfolio", "date_added": date.today() - timedelta(days=90)},
    {"name": "Post Office FD", "type": "FD", "value": 10000, "notes": "5-year fixed deposit", "date_added": date.today() - timedelta(days=365)},
]

for inv_data in investments_data:
    investment = models.Investment(user_id=demo_user.id, **inv_data)
    db.add(investment)

db.commit()
print(f"✓ Created {len(investments_data)} investments")

print("\n🎉 Database seeded successfully!")
print(f"   Email: demo@walleter.app")
print(f"   Password: demo123")

db.close()
