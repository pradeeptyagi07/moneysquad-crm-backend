import app from "./app";
import dotenv from "dotenv";
import { connectDB } from "./config/db/db";

dotenv.config();

// const PORT = process.env.PORT;

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5002;

// ANSI escape codes for styling
const reset = "\x1b[0m";
const bright = "\x1b[1m";
const cyan = "\x1b[36m";
const yellow = "\x1b[33m";
const green = "\x1b[32m";
const magenta = "\x1b[35m";
const red = "\x1b[31m";
const underline = "\x1b[4m";

app.listen(PORT, '0.0.0.0', () => {
    connectDB();
    console.clear(); // Clears the terminal for a clean look
    console.log(`${yellow}${bright}=========================================${reset}`);
    console.log(`${cyan}${bright}🚀 SERVER STARTED SUCCESSFULLY! 🚀${reset}`);
    console.log(`${yellow}${bright}=========================================${reset}`);
    console.log(``);
    console.log(`${green}${bright}✔ Server running at:${reset} ${cyan}${underline}http://localhost:${PORT}${reset}`);
    console.log(`${magenta}${bright}📅 Date:${reset} ${yellow}${new Date().toLocaleString()}${reset}`);
    console.log(`${red}${bright}💡 Tip:${reset} Press ${red}CTRL+C${reset} to stop the server`);
    console.log(``);
});
