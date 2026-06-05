from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import InventoryLogResponse

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=list[InventoryLogResponse])
def get_inventory(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.name).all()
    return [
        InventoryLogResponse(
            product_id=p.id,
            product_name=p.name,
            product_sku=p.sku,
            stock_quantity=p.stock_quantity,
            price=p.price,
        )
        for p in products
    ]
