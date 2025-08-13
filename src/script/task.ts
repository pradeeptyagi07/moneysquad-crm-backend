import dayjs from "dayjs";
import { Timeline } from "../model/timeline.model";
import { CombinedUser } from "../model/user/user.model";
import { getRelatedLeadIds, getUserContext } from "../services/dashboard/dashboard.service";
import { UserStatus } from "../model/user/interfaces";
import mongoose from "mongoose";

export async function expireLeadsBasedOnTimeline(today: Date) {
    const allLeads = await CombinedUser.find({ role: 'lead' });

    for (const lead of allLeads) {
        const latestTimeline = await Timeline.findOne({ leadId: lead.leadId })
            .sort({ createdAt: -1 });

        if (!latestTimeline) continue;

        const daysSinceUpdate = Math.floor((today.getTime() - latestTimeline.createdAt.getTime()) / (1000 * 60 * 60 * 24));

        if (
            (lead.status === 'pending' && daysSinceUpdate >= 60) ||
            ((lead.status === 'login' || lead.status === 'approved') && daysSinceUpdate >= 30)
        ) {
            lead.status = 'expired';
            await lead.save();
            console.log(`✅ Lead ${lead.leadId} expired. Previous status: ${lead.status}`);
        }
    }
}
export async function LeadsActiveStatusJob(today: Date) {
const allPartners = await CombinedUser.find({ role: 'partner' });
const sixtyDaysAgo = dayjs(today).subtract(60, "days").toDate();

  for (const partner of allPartners) {
    try {
      // Step 1: Get user context
      const userContext = await getUserContext(String(partner._id));

      // Step 2: Get related lead IDs
      const relatedLeadIds = await getRelatedLeadIds(userContext);
        console.log("relatedLeadIds raw:", relatedLeadIds);
      
        const hasRecentLead = await CombinedUser.find({
        _id: { $in: relatedLeadIds },
        createdAt: { $gte: sixtyDaysAgo }
        });

      // Step 4: Update partner status
      partner.status = hasRecentLead.length > 0 ? ("active" as UserStatus) : ("inactive" as UserStatus);
      await partner.save();
    } catch (err) {
      console.error(`Error processing partner ${partner._id}:`, err);
    }
}
}