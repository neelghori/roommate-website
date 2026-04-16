import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Container, PageHeader } from "@/components/layout/Footer";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";
import { Tabs } from "@/components/ui/Tabs";
import Link from "next/link";
import { Check, X, Clock } from "lucide-react";

export default async function RequestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [received, sent] = await Promise.all([
    db.roommateRequest.findMany({
      where: { receiverId: session.user.id },
      include: {
        sender: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.roommateRequest.findMany({
      where: { senderId: session.user.id },
      include: {
        receiver: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const pendingReceived = received.filter((r) => r.status === "PENDING").length;

  return (
    <Container className="py-8 max-w-3xl">
      <PageHeader title="Roommate Requests" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Requests" }]} />

      <div className="space-y-6">
        {/* Received Requests */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            Received <span className="text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">{received.length}</span>
            {pendingReceived > 0 && <span className="text-xs bg-warning-100 text-warning-700 rounded-full px-2 py-0.5">{pendingReceived} pending</span>}
          </h2>
          {received.length === 0 ? (
            <p className="text-text-muted text-sm py-6 text-center">No requests received yet</p>
          ) : (
            <div className="space-y-3">
              {received.map((req) => (
                <div key={req.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
                  <Link href={`/roommates/${req.sender.id}`}>
                    <Avatar src={req.sender.image} name={req.sender.name ?? ""} size="md" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary">{req.sender.name}</p>
                    {req.message && <p className="text-sm text-text-secondary truncate">&quot;{req.message}&quot;</p>}
                    <p className="text-xs text-text-muted mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(req.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={req.status} />
                    {req.status === "PENDING" && (
                      <>
                        <form action={`/api/requests/${req.id}`} method="PATCH">
                          <input type="hidden" name="status" value="ACCEPTED" />
                          <Button size="icon-sm" variant="success" type="submit" aria-label="Accept">
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                        <form action={`/api/requests/${req.id}`} method="PATCH">
                          <input type="hidden" name="status" value="REJECTED" />
                          <Button size="icon-sm" variant="danger-outline" type="submit" aria-label="Reject">
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sent Requests */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            Sent <span className="text-xs bg-surface-overlay text-text-secondary rounded-full px-2 py-0.5">{sent.length}</span>
          </h2>
          {sent.length === 0 ? (
            <p className="text-text-muted text-sm py-6 text-center">No requests sent yet. <Link href="/roommates" className="text-primary-600 hover:underline">Browse roommates →</Link></p>
          ) : (
            <div className="space-y-3">
              {sent.map((req) => (
                <div key={req.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
                  <Link href={`/roommates/${req.receiver.id}`}>
                    <Avatar src={req.receiver.image} name={req.receiver.name ?? ""} size="md" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary">{req.receiver.name}</p>
                    {req.message && <p className="text-sm text-text-secondary truncate">&quot;{req.message}&quot;</p>}
                    <p className="text-xs text-text-muted mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(req.createdAt)}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Container>
  );
}
