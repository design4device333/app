from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'vipalla_db')]

# Create the main app
app = FastAPI(title="ViPallá API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class OrderStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    PICKING_UP = "picking_up"
    DELIVERING = "delivering"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentMethod(str, Enum):
    BIZUM = "bizum"
    CARD = "card"
    CASH = "cash"

class UserRole(str, Enum):
    CLIENT = "client"
    DRIVER = "driver"
    ADMIN = "admin"

# Models
class Store(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    address: str
    phone: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StoreCreate(BaseModel):
    name: str
    category: str
    address: str
    phone: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class OrderItem(BaseModel):
    name: str
    quantity: int
    notes: Optional[str] = None

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    store_id: str
    store_name: str
    customer_name: str
    customer_phone: str
    customer_address: str
    items: List[OrderItem]
    notes: Optional[str] = None
    payment_method: PaymentMethod
    status: OrderStatus = OrderStatus.PENDING
    driver_id: Optional[str] = None
    driver_name: Optional[str] = None
    estimated_delivery: Optional[str] = None
    total_amount: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    store_id: str
    store_name: str
    customer_name: str
    customer_phone: str
    customer_address: str
    items: List[OrderItem]
    notes: Optional[str] = None
    payment_method: PaymentMethod
    total_amount: Optional[float] = None

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    driver_id: Optional[str] = None
    driver_name: Optional[str] = None
    estimated_delivery: Optional[str] = None

class Driver(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    is_available: bool = True
    is_active: bool = True
    current_order_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DriverCreate(BaseModel):
    name: str
    phone: str

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    is_available: Optional[bool] = None
    is_active: Optional[bool] = None

class PaymentInfo(BaseModel):
    bizum_phone: str = "612345678"
    card_info: str = "Contactar para datos de tarjeta"
    cash_note: str = "Pago en efectivo al repartidor"

# Store Routes
@api_router.get("/stores", response_model=List[Store])
async def get_stores():
    stores = await db.stores.find({"is_active": True}).to_list(100)
    return [Store(**store) for store in stores]

@api_router.get("/stores/{store_id}", response_model=Store)
async def get_store(store_id: str):
    store = await db.stores.find_one({"id": store_id})
    if not store:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")
    return Store(**store)

@api_router.post("/stores", response_model=Store)
async def create_store(store_data: StoreCreate):
    store = Store(**store_data.dict())
    await db.stores.insert_one(store.dict())
    return store

@api_router.put("/stores/{store_id}", response_model=Store)
async def update_store(store_id: str, store_data: StoreCreate):
    store = await db.stores.find_one({"id": store_id})
    if not store:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")
    
    update_data = store_data.dict()
    await db.stores.update_one({"id": store_id}, {"$set": update_data})
    updated_store = await db.stores.find_one({"id": store_id})
    return Store(**updated_store)

@api_router.delete("/stores/{store_id}")
async def delete_store(store_id: str):
    result = await db.stores.update_one({"id": store_id}, {"$set": {"is_active": False}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")
    return {"message": "Tienda eliminada correctamente"}

# Order Routes
@api_router.get("/orders", response_model=List[Order])
async def get_orders(status: Optional[str] = None, driver_id: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if driver_id:
        query["driver_id"] = driver_id
    orders = await db.orders.find(query).sort("created_at", -1).to_list(100)
    return [Order(**order) for order in orders]

@api_router.get("/orders/pending", response_model=List[Order])
async def get_pending_orders():
    orders = await db.orders.find({"status": OrderStatus.PENDING}).sort("created_at", -1).to_list(100)
    return [Order(**order) for order in orders]

@api_router.get("/orders/active", response_model=List[Order])
async def get_active_orders():
    active_statuses = [OrderStatus.ACCEPTED, OrderStatus.PICKING_UP, OrderStatus.DELIVERING]
    orders = await db.orders.find({"status": {"$in": active_statuses}}).sort("created_at", -1).to_list(100)
    return [Order(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return Order(**order)

@api_router.get("/orders/track/{order_id}", response_model=Order)
async def track_order(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return Order(**order)

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    order = Order(**order_data.dict())
    await db.orders.insert_one(order.dict())
    return order

@api_router.put("/orders/{order_id}", response_model=Order)
async def update_order(order_id: str, order_update: OrderUpdate):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    update_data = {k: v for k, v in order_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    updated_order = await db.orders.find_one({"id": order_id})
    return Order(**updated_order)

@api_router.post("/orders/{order_id}/accept")
async def accept_order(order_id: str, driver_id: str, driver_name: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    if order["status"] != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="El pedido ya ha sido aceptado")
    
    await db.orders.update_one(
        {"id": order_id}, 
        {"$set": {
            "status": OrderStatus.ACCEPTED,
            "driver_id": driver_id,
            "driver_name": driver_name,
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Update driver availability
    await db.drivers.update_one(
        {"id": driver_id},
        {"$set": {"is_available": False, "current_order_id": order_id}}
    )
    
    updated_order = await db.orders.find_one({"id": order_id})
    return Order(**updated_order)

@api_router.post("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: OrderStatus):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    # If delivered, free up the driver
    if status == OrderStatus.DELIVERED and order.get("driver_id"):
        await db.drivers.update_one(
            {"id": order["driver_id"]},
            {"$set": {"is_available": True, "current_order_id": None}}
        )
    
    updated_order = await db.orders.find_one({"id": order_id})
    return Order(**updated_order)

# Driver Routes
@api_router.get("/drivers", response_model=List[Driver])
async def get_drivers():
    drivers = await db.drivers.find({"is_active": True}).to_list(100)
    return [Driver(**driver) for driver in drivers]

@api_router.get("/drivers/available", response_model=List[Driver])
async def get_available_drivers():
    drivers = await db.drivers.find({"is_active": True, "is_available": True}).to_list(100)
    return [Driver(**driver) for driver in drivers]

@api_router.get("/drivers/{driver_id}", response_model=Driver)
async def get_driver(driver_id: str):
    driver = await db.drivers.find_one({"id": driver_id})
    if not driver:
        raise HTTPException(status_code=404, detail="Repartidor no encontrado")
    return Driver(**driver)

@api_router.get("/drivers/{driver_id}/orders", response_model=List[Order])
async def get_driver_orders(driver_id: str):
    orders = await db.orders.find({"driver_id": driver_id}).sort("created_at", -1).to_list(100)
    return [Order(**order) for order in orders]

@api_router.post("/drivers", response_model=Driver)
async def create_driver(driver_data: DriverCreate):
    driver = Driver(**driver_data.dict())
    await db.drivers.insert_one(driver.dict())
    return driver

@api_router.put("/drivers/{driver_id}", response_model=Driver)
async def update_driver(driver_id: str, driver_update: DriverUpdate):
    driver = await db.drivers.find_one({"id": driver_id})
    if not driver:
        raise HTTPException(status_code=404, detail="Repartidor no encontrado")
    
    update_data = {k: v for k, v in driver_update.dict().items() if v is not None}
    await db.drivers.update_one({"id": driver_id}, {"$set": update_data})
    updated_driver = await db.drivers.find_one({"id": driver_id})
    return Driver(**updated_driver)

@api_router.delete("/drivers/{driver_id}")
async def delete_driver(driver_id: str):
    result = await db.drivers.update_one({"id": driver_id}, {"$set": {"is_active": False}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Repartidor no encontrado")
    return {"message": "Repartidor eliminado correctamente"}

# Payment Info
@api_router.get("/payment-info", response_model=PaymentInfo)
async def get_payment_info():
    return PaymentInfo()

# Health check
@api_router.get("/")
async def root():
    return {"message": "ViPallá API", "status": "running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ViPallá API"}

# Stats for admin
@api_router.get("/stats")
async def get_stats():
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": OrderStatus.PENDING})
    active_orders = await db.orders.count_documents({"status": {"$in": [OrderStatus.ACCEPTED, OrderStatus.PICKING_UP, OrderStatus.DELIVERING]}})
    delivered_orders = await db.orders.count_documents({"status": OrderStatus.DELIVERED})
    total_drivers = await db.drivers.count_documents({"is_active": True})
    available_drivers = await db.drivers.count_documents({"is_active": True, "is_available": True})
    total_stores = await db.stores.count_documents({"is_active": True})
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "active_orders": active_orders,
        "delivered_orders": delivered_orders,
        "total_drivers": total_drivers,
        "available_drivers": available_drivers,
        "total_stores": total_stores
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
