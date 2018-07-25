import { writeFileSync } from "fs";
export const info = (msg: string) => console.log(`[i] ${msg}`);
export const warning = (msg: string) => console.log(`[!] ${msg}`);
export const dump = (blop: object) => writeFileSync("./dump.json", JSON.stringify(blop, null, 2));