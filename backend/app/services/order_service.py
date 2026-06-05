from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Customer, Order, OrderItem, Product
from app.schemas import OrderCreate


def create_order(db: Session, order_data: OrderCreate) -> Order:
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {order_data.customer_id} not found",
        )

    product_ids = [item.product_id for item in order_data.items]
    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate products in order are not allowed",
        )

    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    product_map = {p.id: p for p in products}

    if len(products) != len(product_ids):
        missing = set(product_ids) - set(product_map.keys())
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Products not found: {sorted(missing)}",
        )

    for item in order_data.items:
        product = product_map[item.product_id]
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                    f"Available: {product.stock_quantity}, Requested: {item.quantity}"
                ),
            )

    order = Order(customer_id=order_data.customer_id, status="confirmed", total_amount=Decimal("0"))
    db.add(order)
    db.flush()

    total_amount = Decimal("0")
    for item in order_data.items:
        product = product_map[item.product_id]
        subtotal = Decimal(str(product.price)) * item.quantity
        total_amount += subtotal

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price,
            subtotal=subtotal,
        )
        db.add(order_item)
        product.stock_quantity -= item.quantity

    order.total_amount = total_amount
    db.commit()
    db.refresh(order)
    return order
