#!/usr/bin/env python3
import asyncio
import sys
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

sys.path.insert(0, '/app/backend')

async def seed_data():
    mongo_url = os.environ.get('MONGO_URI', 'mongodb://localhost:27017')
    db_name = os.environ.get('MONGO_DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Seeding service categories...")
    
    services = [
        {
            "category_id": "service_elec001",
            "name": "Electrician",
            "description": "Professional electrical repairs and installations. From wiring to circuit breakers, we handle all your electrical needs safely.",
            "price_range": "$50 - $150",
            "estimated_time": "1-2 hours",
            "icon": "⚡",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "category_id": "service_plumb001",
            "name": "Plumber",
            "description": "Expert plumbing services for leaks, pipe repairs, installations, and drainage solutions.",
            "price_range": "$60 - $200",
            "estimated_time": "1-3 hours",
            "icon": "🔧",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "category_id": "service_carp001",
            "name": "Carpenter",
            "description": "Skilled carpentry work including furniture repair, custom woodwork, and door/window installations.",
            "price_range": "$70 - $250",
            "estimated_time": "2-4 hours",
            "icon": "🪚",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "category_id": "service_ac001",
            "name": "AC Repair",
            "description": "Complete AC maintenance, repair, and servicing. Gas refilling, deep cleaning, and installations.",
            "price_range": "$80 - $300",
            "estimated_time": "1-2 hours",
            "icon": "❄️",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "category_id": "service_wash001",
            "name": "Washing Machine Repair",
            "description": "Expert washing machine repairs for all brands. Fixing drainage issues, motor problems, and more.",
            "price_range": "$50 - $180",
            "estimated_time": "1-2 hours",
            "icon": "🧺",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "category_id": "service_fridge001",
            "name": "Refrigerator Repair",
            "description": "Professional refrigerator repair services. Cooling issues, compressor problems, and gas charging.",
            "price_range": "$60 - $250",
            "estimated_time": "1-3 hours",
            "icon": "🧊",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "category_id": "service_ro001",
            "name": "RO / Water Purifier Repair",
            "description": "Water purifier servicing, filter replacement, and repairs for all RO systems.",
            "price_range": "$30 - $120",
            "estimated_time": "30 mins - 1 hour",
            "icon": "💧",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "category_id": "service_micro001",
            "name": "Microwave Repair",
            "description": "Microwave oven repairs including heating issues, turntable problems, and panel repairs.",
            "price_range": "$40 - $150",
            "estimated_time": "1 hour",
            "icon": "🍳",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "category_id": "service_geyser001",
            "name": "Geyser Repair",
            "description": "Water heater repairs, thermostat replacement, and element fixing for all geyser types.",
            "price_range": "$50 - $180",
            "estimated_time": "1-2 hours",
            "icon": "🔥",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "category_id": "service_chimney001",
            "name": "Chimney & Hob Repair",
            "description": "Kitchen chimney and hob repairs, deep cleaning, and motor replacement services.",
            "price_range": "$40 - $160",
            "estimated_time": "1-2 hours",
            "icon": "🍳",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "category_id": "service_mobile001",
            "name": "Mobile Repair",
            "description": "Smartphone repairs including screen replacement, battery change, and software fixes.",
            "price_range": "$30 - $200",
            "estimated_time": "30 mins - 2 hours",
            "icon": "📱",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    existing_count = await db.service_categories.count_documents({})
    if existing_count == 0:
        await db.service_categories.insert_many(services)
        print(f"Inserted {len(services)} service categories")
    else:
        print(f"Service categories already exist ({existing_count} found)")
    
    print("\nSeeding complete!")
    print("\nYou can now:")
    print("1. Register as a customer and book services")
    print("2. Register as a professional and accept bookings")
    print("3. Login as admin to manage the platform")
    print("\nNote: Create an admin user manually in MongoDB if needed.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
