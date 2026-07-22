import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEndpointPermission } from "@/hooks/useEndpointPermission";
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/DataTable/DataTable";

import {
  useGetApprovalDetailQuery,
  useSubmitApprovalDecisionMutation,
} from "@/store/api/endpoints/approvalDetail.endpoints";
import { FILE_STATUS } from "@/lib/fileStatus";

// ── Presentational helpers ───────────────────────────────────────────────────

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-4 py-2 text-sm border-b last:border-0">
      <span className="w-40 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium break-all">{value ?? "—"}</span>
    </div>
  );
}

function ApproverAvatar({ name, email }) {
  const initials = (name || email || "?")
    .split(/[\s@]/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
        {initials}
      </span>
      <span className="font-medium">{name || email}</span>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function FileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isFetching, isError, error } = useGetApprovalDetailQuery(id);
  const [submitDecision] = useSubmitApprovalDecisionMutation();
  const canSubmitApproval = useEndpointPermission("ifgapi/approvals/approve");
  const reviewMarked = useRef(false);

  const [comment,   setComment]   = useState("");
  const [submitting, setSubmitting] = useState(null); // 'approve' | 'reject' | null
  const [decision,  setDecision]  = useState(null);

  useEffect(() => {
    if (!data || reviewMarked.current) return
    const loggedInEmail = Cookies.get("email") ?? ""
    const myEntry = data.approval_details?.find(
      (a) => a.email?.toLowerCase() === loggedInEmail.toLowerCase()
    )
    if (myEntry?.status === FILE_STATUS.PENDING) {
      reviewMarked.current = true
      submitDecision({ version_id: id, decision: FILE_STATUS.REVIEW, comment: "" })
    }
  }, [data, id, submitDecision])

  // ── Loading / error ──────────────────────────────────────────────────────
  if (isLoading || (!data && isFetching)) {
    return (
      <section className="flex items-center gap-2 px-4 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </section>
    );
  }

  if (isError) {
    return (
      <section className="px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-sm text-destructive">
          {error?.data ?? "Failed to load detail."}
        </p>
      </section>
    );
  }

  if (!data) return null;

  const {
    file,
    version,
    approval_details = [],
    version_history  = [],
    activity_log     = [],
  } = data; 
  const loggedInEmail   = Cookies.get("email") ?? "";
  const myApprovalEntry = approval_details.find(
    (a) => a.email?.toLowerCase() === loggedInEmail.toLowerCase(),
  );
  const isApprover    = !!myApprovalEntry;
  const alreadyDecided = isApprover && (
    myApprovalEntry.status === FILE_STATUS.APPROVED ||
    myApprovalEntry.status === FILE_STATUS.REJECTED
  );

  const displayStatus = version?.display_status ?? version?.status ?? "—";
  const rawStatus     = version?.status ?? "";

  const canStillDecide = [
    FILE_STATUS.PENDING,
    FILE_STATUS.REVIEW,
    FILE_STATUS.PARTIALLY_APPROVED,
  ].includes(rawStatus);
  const approvalMode  = version?.approval_mode ?? null;
  const downloadUrl   = version?.download_url  ?? null;

  async function handleDownload() {
    if (!downloadUrl) return;
    try {
      const res  = await fetch(downloadUrl);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = version?.file_name ?? file?.file_name ?? "file";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(downloadUrl, "_blank");
    }
  }

  async function handleDecide(dec) {
    if (!comment.trim()) {
      toast.error("A comment is required before submitting your decision.");
      return;
    }
    setSubmitting(dec);
    try {
      await submitDecision({ version_id: id, decision: dec, comment: comment.trim() }).unwrap();
      setDecision(dec);
      toast.success(
        dec === "approve"
          ? "Approved successfully."
          : "Rejected — file returned to contributor.",
      );
      // invalidatesTags on the mutation auto-refetches the detail
    } catch (err) {
      toast.error(err?.data ?? "Failed to submit decision.");
    } finally {
      setSubmitting(null);
    }
  }

  const version_columns = [
    {
      accessorKey: "input_version",
      header: "Version",
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-xs">{row.getValue("input_version")}</span>
      ),
    },
    {
      id: "change_summary",
      header: "Changes Summary",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.change_summary || row.original.description || "—"}
        </span>
      ),
    },
    {
      accessorKey: "submitted_by",
      header: "Submitted By",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("submitted_by")}</span>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const d = row.getValue("date");
        return (
          <span className="text-muted-foreground whitespace-nowrap">
            {d ? new Date(d).toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.getValue("status");
        return <Badge status={s} className="text-xs capitalize">{s}</Badge>;
      },
    },
  ];

  return (
    <section className="flex flex-col gap-4 px-4 py-1">
      <div>
        <Button variant="ghost" className="py-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-extrabold mb-1">File Detail</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Review file metadata, version history, and approver decisions.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg">{file?.file_name ?? "—"}</span>
              <span className="text-sm text-muted-foreground font-mono">
                {version?.input_version ?? "—"}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {file?.governed_app} · {file?.cloud} · {file?.category} · Submitted by {version?.submitted_by ?? "—"}
            </div>
          </div>
          {isApprover && !alreadyDecided && !decision ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 px-3 py-1 text-xs font-medium text-amber-600 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Pending Your Approval
            </span>
          ) : (
            <Badge status={rawStatus} className="shrink-0 capitalize">
              {displayStatus}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-3">
              FILE PROPERTIES
            </p>
            <div className="mb-4">
              <DetailRow label="File name"        value={file?.file_name} />
              <DetailRow label="File Category"    value={file?.category} />
              <DetailRow label="File Type"        value={version?.change_type} />
              <DetailRow label="Application"      value={file?.governed_app} />
              <DetailRow label="Cloud"            value={file?.cloud} />
              <DetailRow label="Approve type"     value={approvalMode} />
              <DetailRow label="Current version"  value={file?.current_input_version} />
              <DetailRow label="Previous version" value={version?.previous_version} />
              <DetailRow
                label="Submitted by"
                value={
                  version?.submitted_by && version?.submitted_at
                    ? `${version.submitted_by} · ${new Date(version.submitted_at).toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
                    : version?.submitted_by
                }
              />
            </div>

            {version?.description && (
              <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm mb-4">
                <p className="font-semibold mb-1">Description from contributor:</p>
                <p className="text-muted-foreground leading-relaxed">{version.description}</p>
              </div>
            )}

            <Button className="w-full" disabled={!downloadUrl} onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download file to review
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-1.5">
              Open in Excel/VS Code to inspect changes before deciding
            </p>
          </div>

          <div>
            {isApprover && canSubmitApproval && canStillDecide && (
              <>
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-3">
                  {alreadyDecided || decision ? "YOUR DECISION STATUS" : "YOUR DECISION"}
                </p>

                {decision && (
                  <div className={`rounded-lg border px-4 py-3 mb-4 ${decision === "approve" ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-destructive/30 bg-destructive/5"}`}>
                    <p className={`text-sm font-semibold flex items-center gap-1.5 mb-2 ${decision === "approve" ? "text-green-700 dark:text-green-400" : "text-destructive"}`}>
                      {decision === "approve"
                        ? <CheckCircle className="h-4 w-4" />
                        : <XCircle className="h-4 w-4" />}
                      {decision === "approve" ? "You approved this file" : "You rejected this file"}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Your recorded comment:</p>
                    <p className="text-sm italic text-foreground">"{comment}"</p>
                  </div>
                )}

                {!decision && alreadyDecided && (
                  <div className={`rounded-lg border px-4 py-3 mb-4 ${myApprovalEntry.status === "approved" ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-destructive/30 bg-destructive/5"}`}>
                    <p className={`text-sm font-semibold flex items-center gap-1.5 mb-1 ${myApprovalEntry.status === "approved" ? "text-green-700 dark:text-green-400" : "text-destructive"}`}>
                      {myApprovalEntry.status === "approved"
                        ? <CheckCircle className="h-4 w-4" />
                        : <XCircle className="h-4 w-4" />}
                      You {myApprovalEntry.display_status?.toLowerCase() ?? myApprovalEntry.status} this file
                    </p>
                    {myApprovalEntry.comment && (
                      <>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Your recorded comment:</p>
                        <p className="text-sm italic text-foreground">"{myApprovalEntry.comment}"</p>
                      </>
                    )}
                    {myApprovalEntry.decided_at && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Submitted on {new Date(myApprovalEntry.decided_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {!decision && !alreadyDecided && (
                  <>
                    <Textarea
                      placeholder="Add a comment (required for approval and rejection)…"
                      className="resize-none min-h-24 mb-3"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        className="w-full bg-green-700 hover:bg-green-800 text-white"
                        disabled={!!submitting || !comment.trim()}
                        onClick={() => handleDecide("approve")}
                      >
                        {submitting === "approve"
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <CheckCircle className="mr-2 h-4 w-4" />}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={!!submitting || !comment.trim()}
                        onClick={() => handleDecide("reject")}
                      >
                        {submitting === "reject"
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <XCircle className="mr-2 h-4 w-4" />}
                        Reject — return to contributor
                      </Button>
                    </div>
                    <div className="mt-3 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Approve</span> → File receives version number, available for release tagging.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Reject</span> → File returned to contributor. Must fix and re-upload.
                      </p>
                    </div>
                  </>
                )}

                <Separator className="my-4" />
              </>
            )}

            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-3">
              APPROVERS {approval_details.length > 0 && "DETAILS"}
            </p>
            <div className="flex flex-col gap-3">
              {approval_details.length === 0 && (
                <p className="text-sm text-muted-foreground">No approvers assigned.</p>
              )}
              {approval_details.map((a) => {
                const isMe = a.email?.toLowerCase() === loggedInEmail.toLowerCase()
                return (
                  <div key={a.email} className="flex items-center gap-2">
                    <ApproverAvatar name={a.full_name} email={a.email} />
                    {isMe && <span className="text-xs text-muted-foreground">(You)</span>}
                    <span className="text-xs text-muted-foreground">·</span>
                    <Badge
                      status={a.status}
                      variant={a.status === "pending" ? "outline" : undefined}
                      className="capitalize text-xs"
                    >
                      {a.display_status ?? a.status}
                    </Badge>
                    {a.decided_at && (
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        · {new Date(a.decided_at).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {approvalMode && (
              <p className="text-xs text-muted-foreground mt-3">
                {approvalMode === "independent"
                  ? "Approval is dynamic — any assigned approver can act independently."
                  : "Approval configuration requires a unanimous decision. All requirements have not been satisfied."}
              </p>
            )}
          </div>
        </div>
      </div>

      {version_history.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-4">
            VERSION HISTORY
          </p>
          <DataTable columns={version_columns} data={version_history} emptyMessage="No version history." />
        </div>
      )}

      {activity_log.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-4">
            ACTIVITY LOG
          </p>
          <div className="flex flex-col divide-y">
            {activity_log.map((entry) => (
              <div key={entry.audit_id} className="flex gap-6 py-2.5 text-sm">
                <span className="w-40 shrink-0 text-muted-foreground whitespace-nowrap">
                  {entry.timestamp
                    ? new Date(entry.timestamp).toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </span>
                <span className="text-foreground">{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
