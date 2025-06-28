"use strict";
// import { Request, Response } from "express";
// import * as XLSX from "xlsx";
// import prisma from "../../prisma/client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOrganizationBranchExcel = void 0;
const XLSX = __importStar(require("xlsx"));
const client_1 = __importDefault(require("../../prisma/client"));
const uploadOrganizationBranchExcel = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        // Read Excel buffer
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        const [headersRow, ...dataRows] = sheet;
        // Create header index mapping
        const headerIndexMap = headersRow.reduce((acc, header, idx) => {
            acc[header.toLowerCase().trim()] = idx;
            return acc;
        }, {});
        // Loop through rows
        for (const row of dataRows) {
            const organizationName = row[headerIndexMap["organization name"]]?.trim();
            const organizationType = row[headerIndexMap["organization type"]]?.trim();
            const organizationLogo = row[headerIndexMap["organization logo"]]?.trim();
            const branchName = row[headerIndexMap["branch name"]]?.trim();
            const address = row[headerIndexMap["address"]]?.trim();
            const contactNumber = row[headerIndexMap["contact number"]]?.trim();
            const branchType = row[headerIndexMap["branch type"]]?.trim();
            const mapUrl = row[headerIndexMap["map url"]]?.trim();
            const photo = row[headerIndexMap["photo"]]?.trim();
            const offer = row[headerIndexMap["offer"]]?.trim();
            const state = row[headerIndexMap["state"]]?.trim();
            const city = row[headerIndexMap["city"]]?.trim();
            if (!organizationName || !branchName || !state || !city)
                continue;
            // Find or create organization
            let organization = await client_1.default.organization.findFirst({
                where: { name: organizationName },
            });
            if (organization) {
                await client_1.default.organization.update({
                    where: { id: organization.id },
                    data: {
                        type: organizationType || undefined,
                        logo: organizationLogo || undefined,
                    },
                });
            }
            else {
                organization = await client_1.default.organization.create({
                    data: {
                        name: organizationName,
                        type: organizationType || "",
                        logo: organizationLogo || "",
                    },
                });
            }
            // Find branch under organization
            const existingBranch = await client_1.default.branch.findFirst({
                where: {
                    name: branchName,
                    organizationId: organization.id,
                },
            });
            if (existingBranch) {
                await client_1.default.branch.update({
                    where: { id: existingBranch.id },
                    data: {
                        address: address || "",
                        contactNumber: contactNumber || "",
                        type: branchType || undefined,
                        mapUrl: mapUrl || undefined,
                        photo: photo || undefined,
                        offer: offer || undefined,
                        state,
                        city,
                    },
                });
            }
            else {
                await client_1.default.branch.create({
                    data: {
                        name: branchName,
                        address: address || "",
                        contactNumber: contactNumber || "",
                        type: branchType || undefined,
                        mapUrl: mapUrl || undefined,
                        photo: photo || undefined,
                        offer: offer || undefined,
                        state,
                        city,
                        organizationId: organization.id,
                    },
                });
            }
        }
        res.status(200).json({ message: "Organizations and branches uploaded successfully." });
    }
    catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.uploadOrganizationBranchExcel = uploadOrganizationBranchExcel;
