
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { InviteMemberForm } from "@/components/team/InviteMemberForm";
import { PendingInvites } from "@/components/team/PendingInvites";

export default function TeamManagementPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Team Management</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <InviteMemberForm role="editor" />
          <div className="mt-8">
            <PendingInvites />
          </div>
        </div>
        <TeamMembersList />
      </div>
    </div>
  );
}
