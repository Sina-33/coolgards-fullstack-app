import jwt from "jsonwebtoken";
import User from "../models/User.js";

const admin = async (req, res, next) => {
    try {
        let token = ''
        if (req.cookies.cookieToken) {
            token = req.cookies.cookieToken
        } else {
            token = req.header("Authorization").replace("Bearer ", "");
        }
        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await User.findOne({
            _id: decoded._id,
            "tokens.token": token,
        });

        if (!user) {
            return res.status(401).send({message: "token has expired"});
        }
        if (user.roles.includes("admin")) {
            req.token = token;
            req.user = user;
            next();

        } else {
            return res.status(403).send({message: "you don't have privileges"});
        }
    } catch (e) {
        res.status(401).send({message: "Please authenticate."});
    }
};
export default admin;
