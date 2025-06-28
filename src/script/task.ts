import { Timeline } from "../model/timeline.model";
import { CombinedUser } from "../model/user/user.model";

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