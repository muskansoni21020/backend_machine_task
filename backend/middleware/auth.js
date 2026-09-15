// const jwt = require("jsonwebtoken");

// const auth = (req, res, next) => {

//       console.log("Headers:", req.headers);
//     console.log("Authorization:", req.headers.authorization);
//     try {

//         const authHeader = req.headers.authorization;

        

//         if (!authHeader) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Authorization token required"
//             });
//         }

//         if (!authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid Authorization Header"
//             });
//         }

//         const token = authHeader.split(" ")[1];

//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_SECRET
//         );

//         req.user = decoded;

//         next();

//     } catch (err) {

//         return res.status(401).json({
//             success: false,
//             message: "Token Expired or Invalid"
//         });

//     }
// };

// module.exports = auth;




const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                status_code: "401",
                message: "Authorization token is required"
            });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        if (!token) {
            return res.status(401).json({
                status_code: "401",
                message: "Invalid authorization token"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            status_code: "401",
            message: "Invalid or expired token"
        });
    }
};

module.exports = auth;

