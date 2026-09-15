
const express = require("express");
const { executeQuery } = require("../dbquery");
const { QueryTypes } = require("sequelize");
const auth = require("../middleware/auth");

const router = express.Router();


// ==========================================
// CREATE PRODUCT
// POST /products
// ==========================================
router.post("/products", auth, async (req, res) => {

    const {
        name,
        description,
        price,
        stock_quantity,
        category
    } = req.body;

    try {

        if (
            !name ||
            price === undefined ||
            stock_quantity === undefined ||
            !category
        ) {
            return res.status(400).json({
                status_code: "400",
                message: "Name, price, stock_quantity and category are required"
            });
        }

        if (Number(price) < 0) {
            return res.status(400).json({
                status_code: "400",
                message: "Price cannot be negative"
            });
        }

        if (
            !Number.isInteger(Number(stock_quantity)) ||
            Number(stock_quantity) < 0
        ) {
            return res.status(400).json({
                status_code: "400",
                message: "Stock quantity must be a non-negative integer"
            });
        }

        const result = await executeQuery(
            `
            INSERT INTO products
            (
                name,
                description,
                price,
                stock_quantity,
                category,
                created_at
            )
            VALUES
            (
                :name,
                :description,
                :price,
                :stock_quantity,
                :category,
                NOW()
            )
            `,
            {
                name,
                description: description || null,
                price,
                stock_quantity,
                category
            },
            QueryTypes.INSERT
        );

        return res.status(201).json({
            status_code: "201",
            message: "Product created successfully",
            data: {
                id: result[0],
                name,
                description,
                price,
                stock_quantity,
                category
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


// ==========================================
// GET ALL PRODUCTS
// GET /products
//
// Example:
// /products?search=phone
// /products?category=electronics
// /products?inStock=true
// /products?page=1&limit=10
// ==========================================
router.get("/products",auth, async (req, res) => {

    try {

        const {
            search,
            category,
            inStock,
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.min(
            Math.max(parseInt(limit) || 10, 1),
            100
        );

        const offset = (pageNumber - 1) * limitNumber;

        let conditions = [];
        let replacements = {};

        // Search
        if (search) {
            conditions.push(`
                name LIKE :search
            `);

            replacements.search = `%${search}%`;
        }

        // Category
        if (category) {
            conditions.push(`
                category = :category
            `);

            replacements.category = category;
        }

        // Availability
        if (inStock === "true") {
            conditions.push(`
                stock_quantity > 0
            `);
        }

        if (inStock === "false") {
            conditions.push(`
                stock_quantity = 0
            `);
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        // Get total count
        const countResult = await executeQuery(
            `
            SELECT COUNT(*) AS total
            FROM products
            ${whereClause}
            `,
            replacements,
            QueryTypes.SELECT
        );

        const total = Number(countResult[0].total);

        // Get products
        const products = await executeQuery(
            `
            SELECT
                id,
                name,
                description,
                price,
                stock_quantity,
                category,
                created_at
            FROM products
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT :limit
            OFFSET :offset
            `,
            {
                ...replacements,
                limit: limitNumber,
                offset
            },
            QueryTypes.SELECT
        );

        // return res.status(200).json({
        //     status_code: "200",
        //     message: "Products fetched successfully",

        //     pagination: {
        //         currentPage: pageNumber,
        //         limit: limitNumber,
        //         totalProducts: total,
        //         totalPages: Math.ceil(total / limitNumber)
        //     },

        //     data: products
        // });


        return res.status(200).json(products)

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status_code: "500",
            message: "Internal Server Error"
        });
    }
});


// ==========================================
// GET SINGLE PRODUCT
// GET /products/:id
// ==========================================
router.get("/products/:id", async (req, res) => {

    try {

        const products = await executeQuery(
            `
            SELECT
                id,
                name,
                description,
                price,
                stock_quantity,
                category,
                created_at
            FROM products
            WHERE id = :id
            `,
            {
                id: req.params.id
            },
            QueryTypes.SELECT
        );

        if (products.length === 0) {
            return res.status(404).json({
                status_code: "404",
                message: "Product not found"
            });
        }

        return res.status(200).json({
            status_code: "200",
            message: "Product fetched successfully",
            data: products[0]
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status_code: "500",
            message: "Internal Server Error"
        });
    }
});


// ==========================================
// UPDATE PRODUCT
// PATCH /products/:id
// ==========================================
router.put("/update-products/:id", auth, async (req, res) => {

    const {
        name,
        description,
        price,
        stock_quantity,
        category
    } = req.body;

    try {

        const existing = await executeQuery(
            `
            SELECT id
            FROM products
            WHERE id = :id
            `,
            {
                id: req.params.id
            },
            QueryTypes.SELECT
        );

        if (existing.length === 0) {
            return res.status(404).json({
                status_code: "404",
                message: "Product not found"
            });
        }

        const fields = [];
        const replacements = {
            id: req.params.id
        };

        if (name !== undefined) {
            fields.push("name = :name");
            replacements.name = name;
        }

        if (description !== undefined) {
            fields.push("description = :description");
            replacements.description = description;
        }

        if (price !== undefined) {

            if (Number(price) < 0) {
                return res.status(400).json({
                    status_code: "400",
                    message: "Price cannot be negative"
                });
            }

            fields.push("price = :price");
            replacements.price = price;
        }

        if (stock_quantity !== undefined) {

            if (
                !Number.isInteger(Number(stock_quantity)) ||
                Number(stock_quantity) < 0
            ) {
                return res.status(400).json({
                    status_code: "400",
                    message: "Invalid stock quantity"
                });
            }

            fields.push("stock_quantity = :stock_quantity");
            replacements.stock_quantity = stock_quantity;
        }

        if (category !== undefined) {
            fields.push("category = :category");
            replacements.category = category;
        }

        if (fields.length === 0) {
            return res.status(400).json({
                status_code: "400",
                message: "No fields provided for update"
            });
        }

        await executeQuery(
            `
            UPDATE products
            SET ${fields.join(", ")}
            WHERE id = :id
            `,
            replacements,
            QueryTypes.UPDATE
        );

        const updatedProduct = await executeQuery(
            `
            SELECT *
            FROM products
            WHERE id = :id
            `,
            {
                id: req.params.id
            },
            QueryTypes.SELECT
        );

        return res.status(200).json({
            status_code: "200",
            message: "Product updated successfully",
            data: updatedProduct[0]
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status_code: "500",
            message: "Internal Server Error"
        });
    }
});


// ==========================================
// DELETE PRODUCT
// DELETE /products/:id
// ==========================================
router.delete("/delete-products/:id",  async (req, res) => {

    try {

        const existing = await executeQuery(
            `
            SELECT id
            FROM products
            WHERE id = :id
            `,
            {
                id: req.params.id
            },
            QueryTypes.SELECT
        );

        if (existing.length === 0) {
            return res.status(404).json({
                status_code: "404",
                message: "Product not found"
            });
        }

        await executeQuery(
            `
            DELETE FROM products
            WHERE id = :id
            `,
            {
                id: req.params.id
            },
            QueryTypes.DELETE
        );

        return res.status(200).json({
            status_code: "200",
            message: "Product deleted successfully"
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
