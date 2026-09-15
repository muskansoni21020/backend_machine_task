
const express = require("express");
const { executeQuery } = require("../dbquery");
const { QueryTypes } = require("sequelize");
const auth = require("../middleware/auth");

const router = express.Router();


// ==========================================
// CREATE ORDER
// POST /orders
// ==========================================
router.post("/create-orders", auth, async (req, res) => {

    const { products } = req.body;

    try {

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                status_code: "400",
                message: "Products are required"
            });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of products) {

            const { product_id, quantity } = item;

            if (!product_id || !quantity) {
                return res.status(400).json({
                    status_code: "400",
                    message: "product_id and quantity are required"
                });
            }

            if (
                !Number.isInteger(Number(quantity)) ||
                Number(quantity) <= 0
            ) {
                return res.status(400).json({
                    status_code: "400",
                    message: "Quantity must be a positive integer"
                });
            }

            const productResult = await executeQuery(
                `
                SELECT
                    id,
                    name,
                    price,
                    stock_quantity
                FROM products
                WHERE id = :product_id
                `,
                {
                    product_id
                },
                QueryTypes.SELECT
            );

            if (productResult.length === 0) {
                return res.status(404).json({
                    status_code: "404",
                    message: `Product ${product_id} not found`
                });
            }

            const product = productResult[0];

            if (Number(product.stock_quantity) < Number(quantity)) {
                return res.status(400).json({
                    status_code: "400",
                    message: `Insufficient stock for ${product.name}`,
                    available_stock: product.stock_quantity,
                    requested_quantity: quantity
                });
            }

            const itemTotal =
                Number(product.price) * Number(quantity);

            totalAmount += itemTotal;

            orderItems.push({
                product_id: product.id,
                quantity: Number(quantity),
                price: Number(product.price)
            });
        }

        // Create order
        const orderResult = await executeQuery(
            `
            INSERT INTO orders
            (
                user_id,
                total_amount,
                status,
                created_at
            )
            VALUES
            (
                :user_id,
                :total_amount,
                'Pending',
                NOW()
            )
            `,
            {
                user_id: req.user.userId,
                total_amount: totalAmount
            },
            QueryTypes.INSERT
        );

        const orderId = orderResult[0];

        // Insert items and reduce stock
        for (const item of orderItems) {

            await executeQuery(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    price
                )
                VALUES
                (
                    :order_id,
                    :product_id,
                    :quantity,
                    :price
                )
                `,
                {
                    order_id: orderId,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                },
                QueryTypes.INSERT
            );

            await executeQuery(
                `
                UPDATE products
                SET stock_quantity = stock_quantity - :quantity
                WHERE id = :product_id
                AND stock_quantity >= :quantity
                `,
                {
                    product_id: item.product_id,
                    quantity: item.quantity
                },
                QueryTypes.UPDATE
            );
        }

        return res.status(201).json({
            status_code: "201",
            message: "Order created successfully",
            data: {
                order_id: orderId,
                total_amount: totalAmount,
                status: "Pending",
                products: orderItems
            }
        });

    } catch (error) {

        console.error("Create Order Error:", error);

        return res.status(500).json({
            status_code: "500",
            message: "Internal Server Error",
            error: error.message
        });
    }
});


// ==========================================
// GET USER ORDERS
// GET /orders
// ==========================================
router.get("/get-orders", auth, async (req, res) => {

    try {

        const orders = await executeQuery(
            `
            SELECT
                o.id,
                o.total_amount,
                o.status,
                o.created_at
            FROM orders o
            WHERE o.user_id = :user_id
            ORDER BY o.created_at DESC
            `,
            {
                user_id: req.user.userId
            },
            QueryTypes.SELECT
        );

        return res.status(200).json(orders);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status_code: "500",
            message: "Internal Server Error"
        });
    }
});


// ==========================================
// GET SINGLE ORDER
// GET /orders/:id
// ==========================================
router.get("/get-ordersId/:id", auth, async (req, res) => {

    try {

        const orders = await executeQuery(
            `
            SELECT
                id,
                user_id,
                total_amount,
                status,
                created_at
            FROM orders
            WHERE id = :order_id
            AND user_id = :user_id
            `,
            {
                order_id: req.params.id,
                user_id: req.user.userId
            },
            QueryTypes.SELECT
        );

        if (orders.length === 0) {
            return res.status(404).json({
                status_code: "404",
                message: "Order not found"
            });
        }


        const items = await executeQuery(
            `
            SELECT
                oi.product_id,
                p.name,
                oi.quantity,
                oi.price,
                (oi.quantity * oi.price) AS item_total
            FROM order_items oi
            INNER JOIN products p
                ON p.id = oi.product_id
            WHERE oi.order_id = :order_id
            `,
            {
                order_id: req.params.id
            },
            QueryTypes.SELECT
        );


        return res.status(200).json({
            status_code: "200",
            message: "Order fetched successfully",
            data: {
                ...orders[0],
                products: items
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status_code: "500",
            message: "Internal Server Error"
        });
    }
});


module.exports = router;
