import CommissionModel from "../model/Commission.model";
import PartnerPayoutModel from "../model/PartnerPayout.model";
import PartnerPayoutMetaModel from "../model/PartnerPayoutMeta.model";
import { CombinedUser } from "../model/user/user.model";

export const commissionService = {
    async getAllCommissions(userId: string) {
        const user = await CombinedUser.findById(userId);
        if (!user) return [];

        const filter: any = {};

        if (user.role === "partner") {
            filter.commissionType = user.commissionPlan;
        }

        const data = await CommissionModel.find(filter);
        return data;
    },


    async updateCommissionEntry(
        commissionId: string,
        sheetType: string,
        entryId: string,
        updateData: {
            termLoan?: number;
            overdraft?: number;
            lenderName?: string;
            remark?: string;
        }
    ) {
        const commission = await CommissionModel.findById(commissionId);
        if (!commission) {
            return null;
        }

        const sheet = commission.sheets.find((s) => s.sheetType === sheetType);
        if (!sheet) {
            return null;
        }

        const entry = sheet.entries.id(entryId);
        if (!entry) {
            return null;
        }

        const changes: Record<string, { old: any; new: any }> = {};

        if (updateData.termLoan !== undefined && updateData.termLoan !== entry.termLoan) {
            changes.termLoan = { old: entry.termLoan, new: updateData.termLoan };
            entry.termLoan = updateData.termLoan;
        }

        if (updateData.overdraft !== undefined && updateData.overdraft !== entry.overdraft) {
            changes.overdraft = { old: entry.overdraft, new: updateData.overdraft };
            entry.overdraft = updateData.overdraft;
        }

        if (updateData.lenderName !== undefined && updateData.lenderName !== entry.lenderName) {
            changes.lenderName = { old: entry.lenderName, new: updateData.lenderName };
            entry.lenderName = updateData.lenderName;
        }

        if (updateData.remark !== undefined && updateData.remark !== entry.remark) {
            changes.remark = { old: entry.remark, new: updateData.remark };
            entry.remark = updateData.remark;
        }

        await commission.save();

        console.log("✅ Entry updated and saved successfully.");
        return entry;
    },


    // async getAllPayouts(userId: string) {
    //     console.log("📊 Starting fetch of all partner payouts...");

    //     const loggedInUser = await CombinedUser.findById(userId);
    //     if (!loggedInUser) throw new Error("User not found");

    //     const isPartner = loggedInUser.role === "partner";

    //     const payoutQuery = isPartner
    //         ? { "partner.partnerId": loggedInUser.partnerId }
    //         : {};

    //     const payouts = await PartnerPayoutModel.find(payoutQuery)
    //         .populate("disbursedId") // populate disbursedForm
    //         .sort({ createdAt: -1 });

    //     console.log("payout", payouts)

    //     const enrichedPayouts = [];

    //     for (let index = 0; index < payouts.length; index++) {
    //         const payout = payouts[index];
    //         console.log(`\n🔁 Processing Payout #${index + 1} for Lead ID: ${payout.leadId}`);

    //         const partner = await CombinedUser.findOne({ partnerId: payout.partner.partnerId });
    //         if (!partner) {
    //             console.log(`❌ Partner not found for Partner ID: ${payout.partner.partnerId}`);
    //             continue;
    //         }

    //         let commissionRate: number = 0;
    //         let grossPayout = 0;
    //         let netPayout = 0;
    //         const disbursalAmount = payout.disbursedAmount;

    //         const roleSelection = partner.personalInfo?.roleSelection;
    //         const commissionPlan = partner.commissionPlan;
    //         const loanType = payout.lender.loanType;

    //         if (roleSelection === "leadSharing") {
    //             commissionRate = 0.015;
    //             console.log(`✅ Role is 'leadSharing'. Commission Rate: 1.5%`);
    //         } else if (roleSelection === "fileSharing" && commissionPlan) {
    //             const commissionData = await CommissionModel.findOne({ commissionType: commissionPlan });

    //             if (!commissionData) {
    //                 console.log(`❌ No Commission Data found for Commission Plan: ${commissionPlan}`);
    //             } else {
    //                 let sheetType = "";
    //                 if (loanType.startsWith("PL")) {
    //                     sheetType = "Salaried Individual Cases";
    //                 } else if (loanType.startsWith("BL")) {
    //                     sheetType = "Business (SENP) Cases";
    //                 } else if (loanType.startsWith("SEPL")) {
    //                     sheetType = "Professional (SEP-Dr_CA_others)";
    //                 }

    //                 console.log(`🗂 Using Sheet Type: ${sheetType}`);

    //                 const sheet = commissionData.sheets.find(s => s.sheetType === sheetType);
    //                 if (!sheet) {
    //                     console.log(`❌ No sheet found for sheetType: ${sheetType}`);
    //                 } else {
    //                     const entry = sheet.entries.find(e => e.lenderName === payout.lender.name);
    //                     if (!entry) {
    //                         console.log(`❌ No entry found for lender: ${payout.lender.name}`);
    //                     } else {
    //                         commissionRate = loanType.includes("Overdraft")
    //                             ? (entry.overdraft ?? 0)
    //                             : (entry.termLoan ?? 0);
    //                         console.log(`✅ Entry matched. Commission Rate: ${commissionRate}%`);

    //                         let commissionRemark = entry.remark ?? '';
    //                         let shouldUpdate = false;

    //                         if (payout.commissionRemark !== commissionRemark) {
    //                             console.log("11")
    //                             payout.commissionRemark = commissionRemark;
    //                             shouldUpdate = true;
    //                         }

    //                         console.log("shouldUpdate", shouldUpdate)

    //                         if (shouldUpdate) {
    //                             console.log("22")
    //                             await payout.save();
    //                         }
    //                     }
    //                 }
    //             }
    //         } else {
    //             console.log(`❌ Unknown role or missing commission plan`);
    //         }

    //         if (payout.commission !== (commissionRate * 100)) {
    //             payout.commission = (commissionRate * 100);
    //             console.log("33")
    //             await payout.save(); // persist commission change
    //             console.log(`💾 Saved updated commission: ${commissionRate}%`);
    //         }

    //         grossPayout = (disbursalAmount * (commissionRate * 100)) / 100;
    //         const tds = (grossPayout * 2) / 100;
    //         netPayout = grossPayout - tds;

    //         // 👉 Log full payout calculation details
    //         console.log(`📌 Disbursal Amount: ₹${disbursalAmount}`);
    //         console.log(`📌 Commission %: ${commissionRate}%`);
    //         console.log(`📌 Gross Payout: ₹${grossPayout.toFixed(2)} = ₹${disbursalAmount} x ${commissionRate}%`);
    //         console.log(`📌 TDS (2%): ₹${tds.toFixed(2)} = ₹${grossPayout.toFixed(2)} x 2%`);
    //         console.log(`📌 Net Payout: ₹${netPayout.toFixed(2)} = ₹${grossPayout.toFixed(2)} - ₹${tds.toFixed(2)}`);
    //         const isTopupLoan = (payout.disbursedId as any)?.loanScheme === "Top-up";

    //         enrichedPayouts.push({
    //             ...payout.toObject(),
    //             commission: (commissionRate * 100),
    //             grossPayout,
    //             netPayout,
    //             isTopupLoan, // ✅ Added boolean
    //             payoutStatusUpdatedAt: payout.payoutStatusUpdatedAt,
    //         });
    //     }

    //     console.log(`\n✅ Completed. Total Enriched Payouts: ${enrichedPayouts.length}`);
    //     return enrichedPayouts;
    // },

    async getAllPayouts(userId: string) {
        console.log("📊 [getAllPayouts] Starting fetch of all partner payouts for User ID:", userId);

        const loggedInUser = await CombinedUser.findById(userId);
        if (!loggedInUser) {
            console.error("❌ [getAllPayouts] User not found for ID:", userId);
            throw new Error("User not found");
        }

        const isPartner = loggedInUser.role === "partner";

        const payoutQuery = isPartner
            ? { "partner.partnerId": loggedInUser.partnerId }
            : {};

        const payouts = await PartnerPayoutModel.find(payoutQuery)
            .populate("disbursedId")
            .sort({ createdAt: -1 });



        const enrichedPayouts = [];

        for (let index = 0; index < payouts.length; index++) {
            const payout = payouts[index];

            const partner = await CombinedUser.findOne({ partnerId: payout.partner.partnerId });
            if (!partner) {
                console.warn(`⚠️ Partner not found for Partner ID: ${payout.partner.partnerId}`);
                continue;
            }

            let commissionRate = 0;
            let grossPayout = 0;
            let netPayout = 0;
            const disbursalAmount = payout.disbursedAmount;
            const roleSelection = partner.personalInfo?.roleSelection;
            const commissionPlan = partner.commissionPlan;
            const loanType = payout.lender.loanType;

            console.log(`📄 Commission Plan: ${commissionPlan}`);

            if (roleSelection === "leadSharing") {
                commissionRate = 1.5;
            } else if (roleSelection === "fileSharing" && commissionPlan) {
                const commissionData = await CommissionModel.findOne({ commissionType: commissionPlan });

                if (!commissionData) {
                    console.warn("⚠️ No Commission Data found for Commission Plan:", commissionPlan);
                } else {
                    let sheetType = "";
                    if (loanType.startsWith("PL")) sheetType = "Salaried Individual Cases";
                    else if (loanType.startsWith("BL")) sheetType = "Business (SENP) Cases";
                    else if (loanType.startsWith("SEPL")) sheetType = "Professional (SEP-Dr_CA_others)";
                    const sheet = commissionData.sheets.find(s => s.sheetType === sheetType);
                    if (!sheet) {
                        console.warn(`⚠️ No sheet found for Sheet Type: ${sheetType}`);
                    } else {
                        const entry = sheet.entries.find(e => e.lenderName === payout.lender.name);
                        if (!entry) {
                            console.warn(`⚠️ No commission entry for lender: ${payout.lender.name}`);
                        } else {
                            commissionRate = loanType.includes("Overdraft")
                                ? (entry.overdraft ?? 0)
                                : (entry.termLoan ?? 0);
                            console.log(`✅ Found Commission Entry: ${commissionRate}%`);

                            const commissionRemark = entry.remark ?? "";
                            let shouldUpdate = false;

                            if (payout.commissionRemark !== commissionRemark) {
                                console.log(`📝 Updating commissionRemark: "${payout.commissionRemark}" → "${commissionRemark}"`);
                                payout.commissionRemark = commissionRemark;
                                shouldUpdate = true;
                            }

                            if (shouldUpdate) {
                                console.log("💾 Saving updated remark...");
                                await payout.save();
                            }
                        }
                    }
                }
            } else {
                console.warn("⚠️ Unknown role or missing commission plan. Skipping commission calculation.");
            }


            let finalCommissionRate = 0;

            if (typeof payout.commission === 'number') {
                finalCommissionRate = payout.commission;
                console.log(`📌 Using manually set commission: ${payout.commission}%`);
            } else {
                finalCommissionRate = commissionRate;
                payout.commission = commissionRate;
                await payout.save();
                console.log(`💾 No commission set. Saved calculated commission: ${payout.commission}%`);
            }

            console.log("finalCommissionRate", finalCommissionRate)

            grossPayout = (disbursalAmount * finalCommissionRate)/100;
            const tds = (grossPayout * 2) / 100;
            netPayout = grossPayout - tds;

            console.log(`📌 Disbursal Amount: ₹${disbursalAmount}`);
            console.log(`📌 Gross Payout: ₹${grossPayout.toFixed(2)}`);
            console.log(`📌 TDS (2%): ₹${tds.toFixed(2)}`);
            console.log(`📌 Net Payout: ₹${netPayout.toFixed(2)}`);

            const isTopupLoan = (payout.disbursedId as any)?.loanScheme === "Top-up";

            enrichedPayouts.push({
                ...payout.toObject(),
                commission: finalCommissionRate,
                grossPayout,
                netPayout,
                isTopupLoan,
                payoutStatusUpdatedAt: payout.payoutStatusUpdatedAt,
            });

            console.log(`✅ Enriched payout added for Lead ID: ${payout.leadId}`);
        }

        console.log(`\n✅ [getAllPayouts] Completed processing. Total Enriched Payouts: ${enrichedPayouts.length}`);
        return enrichedPayouts;
    },

    async editPayout(
        payoutId: string,
        updates: { commission?: number; payoutStatus?: "pending" | "paid"; remark?: string }
    ) {
        const payout = await PartnerPayoutModel.findById(payoutId);
        if (!payout) return null;

        const hasStatusChanged = updates.payoutStatus && updates.payoutStatus !== payout.payoutStatus;

        if (updates.commission !== undefined) {
            (payout as any).commission = updates.commission;
        }

        if (updates.remark !== undefined) {
            payout.remark = updates.remark;
        }

        if (hasStatusChanged) {
            payout.payoutStatus = updates.payoutStatus!;
            payout.payoutStatusUpdatedAt = new Date();
        }

        await payout.save();
        return payout;
    },


    async getPartnerMonthlySummary(month: number, year: number) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const payouts = await PartnerPayoutModel.find({
            createdAt: { $gte: start, $lte: end },
        });

        const partnerMap: Record<string, any> = {};

        for (const payout of payouts) {
            const key = payout.partner.partnerId;
            if (!key) continue;

            if (!partnerMap[key]) {
                const partnerUser = await CombinedUser.findOne({ partnerId: key });

                console.log("partnerUser", partnerUser);
                partnerMap[key] = {
                    partnerId: key,
                    partnerName: payout.partner.name,
                    grossPayout: 0,
                    netPayout: 0,
                    amountPaid: 0,
                    tds: 0,
                    gstApplicable: partnerUser?.bankDetails?.isGstBillingApplicable,
                    gstStatus: "Pending",
                    advancesPaid: 0,
                };
            }

            const commissionRate = payout.commission ?? 0;
            const gross = (payout.disbursedAmount * commissionRate) / 100;
            const tds = gross * 0.02;
            const net = gross - tds;

            partnerMap[key].grossPayout += gross;
            partnerMap[key].tds += tds;
            partnerMap[key].netPayout += net;

            if (payout.payoutStatus === "paid") {
                partnerMap[key].amountPaid += net;
            }
        }

        const result: any[] = [];

        for (const item of Object.values(partnerMap)) {
            const { partnerId } = item;

            // Either fetch or create the meta document
            const meta = await PartnerPayoutMetaModel.findOneAndUpdate(
                { partnerId, month, year },
                {},
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            result.push({
                partnerName: item.partnerName,
                partnerId,
                grossPayout: item.grossPayout,
                tds: item.tds,
                netPayout: item.netPayout,
                amountPaid: item.amountPaid,
                amountPending: item.netPayout - item.amountPaid,
                paymentStatus: item.netPayout - item.amountPaid <= 0 ? "Paid" : "Pending",
                gstApplicable: item.gstApplicable,
                gstStatus: meta.gstStatus,
                advancesPaid: meta.advancesPaid,
            });
        }

        return result;
    },

    async getPayoutDetailsById(payoutId: string) {
        const payout = await PartnerPayoutModel.findById(payoutId);

        if (!payout) throw new Error("Payout not found");

        const disbursedAmount = payout.disbursedAmount;
        const commission = payout.commission ?? 0;
        const commissionPercentage = commission; // already stored as percentage
        const grossPayout = (disbursedAmount * commissionPercentage) / 100;
        const tds = (grossPayout * 2) / 100;
        const netPayout = grossPayout - tds;

        return {
            leadId: payout.leadId,
            disbursedAmount,
            commission: commissionPercentage,
            grossPayout,
            tds,
            netPayout,
            remark: payout.remark ?? "",
            commissionRemark: payout.commissionRemark ?? ""
        };
    },

    async editPartnerMeta({
        partnerId,
        month,
        year,
        gstStatus,
        advancesPaid,
    }: {
        partnerId: string;
        month: number;
        year: number;
        gstStatus?: string;
        advancesPaid?: number;
    }) {
        const update: Partial<{ gstStatus: string; advancesPaid: number }> = {};

        if (gstStatus !== undefined) update.gstStatus = gstStatus;
        if (advancesPaid !== undefined) update.advancesPaid = advancesPaid;

        const meta = await PartnerPayoutMetaModel.findOneAndUpdate(
            { partnerId, month, year },
            { $set: update },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return meta;
    },


    async getPartnerMonthlyBreakdown(userId: string) {
        console.log("🟡 Starting monthly breakdown for user:", userId);

        const loggedInUser = await CombinedUser.findById(userId);
        if (!loggedInUser) throw new Error("❌ User not found");

        const partnerDisplayId = loggedInUser.partnerId;
        console.log("✅ Logged-in partnerDisplayId:", partnerDisplayId);

        const payouts = await PartnerPayoutModel.find({
            "partner.partnerId": partnerDisplayId,
        }).populate("disbursedId");

        console.log(`📦 Found ${payouts.length} payouts for partner ${partnerDisplayId}`);

        const grouped: Record<string, any> = {};

        for (const payout of payouts) {
            console.log("payout.disbursedId ", payout.disbursedId)
            const disbursedDate = (payout.disbursedId as any)?.actualDisbursedDate;

            if (!disbursedDate) {
                console.log(`⚠️ Skipping payout ${payout._id} — no disbursalDate found.`);
                continue;
            }

            const date = new Date(disbursedDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const key = `${year}-${month}`;

            console.log(`📆 Processing payout for ${key} — Lead ID: ${payout.leadId}`);

            if (!grouped[key]) {
                grouped[key] = {
                    year,
                    month,
                    totalDisbursals: 0,
                    commissionEarned: 0,
                    payoutPaid: 0,
                    gstStatus: "Pending",
                };
            }

            const commission = payout.commission ?? 0;
            const gross = (payout.disbursedAmount * commission) / 100;
            const tds = gross * 0.02;
            const net = gross - tds;

            console.log(`💰 Calculated for payout ${payout._id}:`);
            console.log(`   ▸ Disbursed Amount: ₹${payout.disbursedAmount}`);
            console.log(`   ▸ Commission Rate: ${commission}`);
            console.log(`   ▸ Gross: ₹${gross}`);
            console.log(`   ▸ TDS (2%): ₹${tds}`);
            console.log(`   ▸ Net: ₹${net}`);

            grouped[key].totalDisbursals += payout.disbursedAmount;
            grouped[key].commissionEarned += net;

            if (payout.payoutStatus === "paid") {
                grouped[key].payoutPaid += net;
                console.log(`   ✅ Payout status is 'paid', adding to payoutPaid.`);
            } else {
                console.log(`   ⏳ Payout status is '${payout.payoutStatus}', skipping payoutPaid.`);
            }
        }

        const result = [];

        for (const key of Object.keys(grouped)) {
            const { year, month, totalDisbursals, commissionEarned, payoutPaid } = grouped[key];
            const payoutPending = commissionEarned - payoutPaid;
            const paymentStatus = payoutPending <= 0 ? "Paid" : "Pending";

            console.log(`📊 Summary for ${key}:`);
            console.log(`   ▸ Total Disbursals: ₹${totalDisbursals}`);
            console.log(`   ▸ Commission Earned: ₹${commissionEarned}`);
            console.log(`   ▸ Payout Paid: ₹${payoutPaid}`);
            console.log(`   ▸ Payout Pending: ₹${payoutPending}`);
            console.log(`   ▸ Payment Status: ${paymentStatus}`);

            // Fetch GST Status from meta
            const meta = await PartnerPayoutMetaModel.findOne({ partnerId: partnerDisplayId, month, year });

            if (meta) {
                console.log(`   ▸ GST Status found in meta: ${meta.gstStatus}`);
            } else {
                console.log(`   ❌ No GST Meta found, defaulting to 'Pending'`);
            }

            result.push({
                month: `${year}-${month.toString().padStart(2, "0")}`,
                totalDisbursals,
                commissionEarned,
                payoutPaid,
                payoutPending,
                paymentStatus,
                gstStatus: meta?.gstStatus || "Pending",
            });
        }

        console.log("✅ Completed monthly breakdown for all months.");

        return result.sort((a, b) => a.month.localeCompare(b.month));
    }


};