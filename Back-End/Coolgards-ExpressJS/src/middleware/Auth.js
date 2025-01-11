import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
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
        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({message: "Please authenticate."});
    }
};
export default auth;
