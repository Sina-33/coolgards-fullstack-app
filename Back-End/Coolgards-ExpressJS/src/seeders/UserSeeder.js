import User from "../models/User.js";
import chalk from "chalk";
import bcrypt from "bcryptjs";

const userSeeder = async () => {
    const prevUser = await User.findOne({
        email: process.env.ADMIN_EMAIL,
    });
    if (!prevUser) {
        const user = new User({
            fullName: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: await bcrypt.hash(process.env.ADMIN_PASS, 8),
            roles: ["admin"],
        });
        user
            .save()
            .then((r) => console.log(chalk.green("User seeded successfully", r)))
            .catch((e) =>
                console.log(chalk.red("Error occurred when tried to seed user", e))
            );
    }
};

userSeeder();
