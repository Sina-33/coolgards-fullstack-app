import mongoose from "mongoose";
import chalk from "chalk";
mongoose.connect(process.env.DB_ADDRESS).catch(error => console.log(chalk.red(error)));
