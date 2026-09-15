// const express = require("express");
// const { executeQuery } = require("../dbquery");
// const { QueryTypes } = require("sequelize");
// const path = require('path');

// const { profile } = require("console");
// const fs = require("fs");
// const jwt = require("jsonwebtoken");
// const auth = require("../middleware/auth");
// const bcrypt = require("bcrypt");

// const router = express.Router();


// router.post("/create-user", async (req, res) => {
//   const {
//     name,
//     email,
//     password,
//     address,
//     latitude,
//     longitude,
//     status,
//       register_day
//   } = req.body;

//   try {


//     const existingUser = await executeQuery(
//       `
//       SELECT id
//       FROM user
//       WHERE email = :email
//       `,
//       { email },
//       QueryTypes.SELECT
//     );


//     if (existingUser.length > 0) {
//       return res.status(409).json({
//         status_code: "409",
//         message: "Email already exists.",
//       });
//     }

//     const registerDay = new Date().getDay();

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const result = await executeQuery(
//       `
//       INSERT INTO user
//       (
//         name,
//         email,
//         password,
//         address,
//         latitude,
//         longitude,
//         status,
//         register_at,
//         register_day
//       )
//       VALUES
//       (
//         :name,
//         :email,
//         :password,
//         :address,
//         :latitude,
//         :longitude,
//         :status,
//         NOW(),
//         :register_day
//       )
//       `,
//       {
//         name,
//         email,
//         password: hashedPassword,
//         address,
//         latitude,
//         longitude,
//         status,
//         register_day
//       },
//       QueryTypes.INSERT
//     );

//     const insertedUserId = result[0];

//     const token = jwt.sign(
//       {
//         userId: insertedUserId,
//         email,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "7d",
//       }
//     );


//     return res.status(200).json({
//       status_code: "200",
//       message: "User created successfully.",
//       data: {
//         id: insertedUserId,
//         name,
//         email,
//         address,
//         latitude,
//         longitude,
//         status,
//         register_day,
//         token,
//       },
//     });


//   } catch (error) {

//     console.error(error);

//     return res.status(500).json({
//       status_code: "500",
//       message: "Internal Server Error",
//       error: error.message,
//     });

//   }
// });

// router.put("/change-all-user-status", auth, async (req, res) => {

    
//   try {
//     await executeQuery(
//       `
//       UPDATE user
//       SET status = CASE
//           WHEN status = 'Active' THEN 'Inactive'
//           WHEN status = 'Inactive' THEN 'Active'
//           ELSE status
//       END
//       `,
//       {},
//       QueryTypes.UPDATE
//     );

//     return res.status(200).json({
//       status_code: "200",
//       message: "All user statuses updated successfully."
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       status_code: "500",
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// });



// router.post("/user-distance/:id", auth, async (req, res) => {
//   const { destination_latitude, destination_longitude } = req.body;
//   const userId = req.params.id; 

//   try {
//     const user = await executeQuery(
//       `
//       SELECT latitude, longitude
//       FROM user
//       WHERE id = :id
//       `,
//       {
//         id: userId,
//       },
//       QueryTypes.SELECT
//     );

//     if (user.length === 0) {
//       return res.status(404).json({
//         status_code: "404",
//         message: "User not found",
//       });
//     }

//     const userLatitude = Number(user[0].latitude);
//     const userLongitude = Number(user[0].longitude);

//     const distance = calculateDistance(
//       userLatitude,
//       userLongitude,
//       Number(destination_latitude),
//       Number(destination_longitude)
//     );

//     return res.status(200).json({
//       status_code: "200",
//       message: "Distance calculated successfully",
//       data: {
//         user_id: userId,
//         current_latitude: userLatitude,
//         current_longitude: userLongitude,
//         destination_latitude,
//         destination_longitude,
//         distance_in_km: distance.toFixed(2),
//       },
//     });

//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       status_code: "500",
//       message: error.message,
//     });
//   }
// });


// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371; // Earth radius in KM

//   const dLat = (lat2 - lat1) * (Math.PI / 180);
//   const dLon = (lon2 - lon1) * (Math.PI / 180);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * (Math.PI / 180)) *
//       Math.cos(lat2 * (Math.PI / 180)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   return R * c;
// }

// router.post("/users-by-day", auth, async(req,res)=>{

//     try {

//         const { week_number } = req.body;


//         if(!Array.isArray(week_number) || week_number.length === 0){
//             return res.status(400).json({
//                 status_code:"400",
//                 message:"week_number is required"
//             });
//         }


//         const users = await executeQuery(
//         `
//         SELECT 
//             name,
//             email,
//             register_day
//         FROM user
//         WHERE register_day IN (:days)
//         `,
//         {
//             days:week_number
//         },
//         QueryTypes.SELECT
//         );


//         const days = [
//             "sunday",
//             "monday",
//             "tuesday",
//             "wednesday",
//             "thursday",
//             "friday",
//             "saturday"
//         ];


//         const response={};


//         week_number.forEach(day=>{
//             response[days[day]]=[];
//         });


//         users.forEach(user=>{

//             response[
//                 days[user.register_day]
//             ].push({
//                 name:user.name,
//                 email:user.email
//             });

//         });


//         return res.status(200).json({

//             status_code:"200",
//             message:"Users fetched successfully",

//             data:response

//         });


//     }catch(error){

//         console.log(error);

//         return res.status(500).json({
//             status_code:"500",
//             message:error.message
//         });

//     }

// });

// module.exports = router;







const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { executeQuery } = require("../dbquery");
const { QueryTypes } = require("sequelize");

const router = express.Router();


// ===============================
// REGISTER
// POST /register
// ===============================
router.post("/register", async (req, res) => {
    const { name, email, password, address } = req.body;

    try {

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                status_code: "400",
                message: "Name, email and password are required"
            });
        }

        // Check if email already exists
        const existingUser = await executeQuery(
            `
            SELECT id
            FROM user
            WHERE email = :email
            `,
            { email },
            QueryTypes.SELECT
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                status_code: "409",
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await executeQuery(
            `
            INSERT INTO user
            (
                name,
                email,
                password,
                address,
                status,
                register_at
            )
            VALUES
            (
                :name,
                :email,
                :password,
                :address,
                'Active',
                NOW()
            )
            `,
            {
                name,
                email,
                password: hashedPassword,
                address: address || null
            },
            QueryTypes.INSERT
        );

        // Get inserted user ID
        const userId = result[0];

        // Generate JWT Token
        const token = jwt.sign(
            {
                userId: userId,
                email: email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Response
        return res.status(201).json({
            status_code: "201",
            message: "User registered successfully",
            data: {
                id: userId,
                name,
                email,
                token
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status_code: "500",
            message: "Internal Server Error",
            error: error.message
        });
    }
});




// ===============================
// LOGIN
// POST /login
// ===============================

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                status_code: "400",
                message: "Email and password are required"
            });
        }

        // Find user by email
        const users = await executeQuery(
            `
            SELECT
                id,
                name,
                email,
                password,
                status
            FROM user
            WHERE email = :email
            `,
            { email },
            QueryTypes.SELECT
        );

        // Check user exists
        if (users.length === 0) {
            return res.status(401).json({
                status_code: "401",
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Check user status
        if (user.status !== "Active") {
            return res.status(403).json({
                status_code: "403",
                message: "User account is inactive"
            });
        }

        // Compare entered password with hashed password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        // Invalid password
        if (!passwordMatch) {
            return res.status(401).json({
                status_code: "401",
                message: "Invalid email or password"
            });
        }

        // Generate a NEW JWT token after successful login
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Successful login response
        return res.status(200).json({
            status_code: "200",
            message: "Login successful",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                token: token
            }
        });

    } catch (error) {

        console.error("Login Error:", error);

        return res.status(500).json({
            status_code: "500",
            message: "Internal Server Error",
            error: error.message
        });
    }
});




module.exports = router;

