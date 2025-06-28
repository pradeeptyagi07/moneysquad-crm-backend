// server/scripts/importCommission.ts
import * as xlsx from "xlsx";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";


import { connectDB } from "../config/db/db";
import CommissionModel from "../model/Commission.model";

dotenv.config();

type SheetType = "Salaried Individual Cases" | "Business (SENP) Cases" | "Professional (SEP-Dr_CA_others)";
type CommissionType = "gold" | "platinum" | "diamond";

interface SheetEntry {
  lenderName: string;
  termLoan: number;
  overdraft: number;
  remark: String;
}

interface SheetData {
  sheetType: SheetType;
  entries: SheetEntry[];
}

interface CommissionData {
  commissionType: CommissionType;
  sheets: SheetData[];
}

const sheetTypeMap: Record<number, SheetType> = {
  0: "Salaried Individual Cases",
  1: "Business (SENP) Cases",
  2: "Professional (SEP-Dr_CA_others)",
};

async function parseExcel(filePath: string, commissionType: CommissionType): Promise<CommissionData> {
  const workbook = xlsx.readFile(filePath);
  const sheets: SheetData[] = [];

  workbook.SheetNames.forEach((_, idx) => {
    const rawData = xlsx.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[workbook.SheetNames[idx]], {
      defval: "",
    });

    const entries: SheetEntry[] = rawData.map((row) => ({
      lenderName: row["LENDER NAME"] ?? "",
      termLoan: (parseFloat(row["Term Loan"]) || 0) * 100,
      overdraft: (parseFloat(row["Overdraft"]) || 0) * 100,
      remark: row["Remarks"] ?? "",
    }));

    const sheetType = sheetTypeMap[idx];
    if (sheetType) {
      sheets.push({ sheetType, entries });
    }
  });

  return { commissionType, sheets };
}

async function importAll() {
  try {
    await connectDB();

    const files: { path: string; type: CommissionType }[] = [
      { path: path.resolve(__dirname, "../assets/gold.xlsx"), type: "gold" },
      { path: path.resolve(__dirname, "../assets/platinum.xlsx"), type: "platinum" },
      { path: path.resolve(__dirname, "../assets/diamond.xlsx"), type: "diamond" },
    ];

    for (const file of files) {
      const data = await parseExcel(file.path, file.type);
      await CommissionModel.findOneAndUpdate(
        { commissionType: data.commissionType },
        data,
        { upsert: true, new: true }
      );
      console.log(`✅ Imported: ${file.type}`);
    }

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error importing commissions:", error);
    await mongoose.disconnect();
  }
}

importAll();