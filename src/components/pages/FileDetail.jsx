import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { ArrowLeft, Download, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { fetchFiles } from "@/store/slice/fileCatalog.slice"
import { FILE_STATUS } from "@/store/slice/filterOptions.slice"
import { selectFileById, selectFileCatalogState } from "@/store/selectors/fileCatalog.selectors"
import { useEffect } from "react"

function OtherApprovers({ status, submittedAt }) {
  const approvers = (() => {
    switch (status) {
      case FILE_STATUS.PARTIALLY_APPROVED:
        return [
          { name: "Approver 1", fileStatus: FILE_STATUS.APPROVED, at: submittedAt },
          { name: "Approver 2", fileStatus: null },
        ]
      case FILE_STATUS.PARTIALLY_REJECTED:
        return [
          { name: "Approver 1", fileStatus: FILE_STATUS.REJECTED, at: submittedAt },
          { name: "Approver 2", fileStatus: null },
        ]
      case FILE_STATUS.APPROVED:
        return [
          { name: "Approver 1", fileStatus: FILE_STATUS.APPROVED, at: submittedAt },
          { name: "Approver 2", fileStatus: FILE_STATUS.APPROVED, at: submittedAt },
        ]
      case FILE_STATUS.REJECTED:
        return [
          { name: "Approver 1", fileStatus: FILE_STATUS.REJECTED, at: submittedAt },
          { name: "Approver 2", fileStatus: FILE_STATUS.REJECTED, at: submittedAt },
        ]
      case FILE_STATUS.ROLLBACK:
        return [
          { name: "Approver 1", fileStatus: FILE_STATUS.APPROVED, at: submittedAt },
          { name: "Approver 2", fileStatus: FILE_STATUS.APPROVED, at: submittedAt },
        ]
      // Pending, Review — nobody has acted yet
      default:
        return [
          { name: "Approver 1", fileStatus: null },
          { name: "Approver 2", fileStatus: null },
        ]
    }
  })()

  return (
    <div className="flex flex-col gap-2">
      {approvers.map(({ name, fileStatus, at }) => (
        <div key={name} className="flex items-center gap-2">
          <ApproverAvatar name={name} />
          {fileStatus ? (
            <>
              <Badge status={fileStatus} className="ml-auto">{fileStatus}</Badge>
              {at && <span className="text-xs text-muted-foreground">· {at}</span>}
            </>
          ) : (
            <Badge variant="outline" className="ml-auto">Pending</Badge>
          )}
        </div>
      ))}
    </div>
  )
}

// Simple label-value row used in the file details section
function DetailRow({ label, value }) {
  return (
    <div className="flex gap-4 py-2 text-sm border-b last:border-0">
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  )
}

// Avatar initials chip for approvers list
function ApproverAvatar({ name }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
        {initials}
      </span>
      <span className="font-medium">{name}</span>
    </div>
  )
}

export default function FileDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { fetchStatus } = useSelector(selectFileCatalogState)
  const file = useSelector(selectFileById(id))

  const [comment, setComment] = useState("")
  const [decision, setDecision] = useState(null) // 'approved' | 'rejected' | null

  useEffect(() => {
    if (fetchStatus === "idle") dispatch(fetchFiles())
  }, [fetchStatus, dispatch])

  if (fetchStatus === "loading") {
    return (
      <section className="px-4 py-6 text-sm text-muted-foreground">
        Loading…
      </section>
    )
  }

  if (!file) {
    return (
      <section className="px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-sm text-muted-foreground">File not found.</p>
      </section>
    )
  }

  const isApprover = file.isApprover ?? false
  const canDecide = isApprover && !decision

  function handleApprove() {
    setDecision("approved")
  }

  function handleReject() {
    setDecision("rejected")
  }

  return (
    <section className="flex flex-col gap-4 px-4 py-1">
      {/* Header — approver view only */}
      <div>
        <Button variant="ghost" className="py-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {isApprover && (
          <>
            <h1 className="text-3xl font-extrabold mb-1">Approvals</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Dynamic hybrid routing — not sequential. Approver reviews the file,
              downloads it for inspection, and submits their decision.
            </p>
          </>
        )}
      </div>

      {/* How-to banner — approver view only */}
      {isApprover && (
        <Alert>
          <AlertTitle className="font-semibold">How to review a file:</AlertTitle>
          <AlertDescription>
            File metadata and change notes are shown below. Download the file to
            inspect it. Return here to approve, request changes, or reject.
            Rejection returns the file to the contributor with your comment.
          </AlertDescription>
        </Alert>
      )}

      {/* Main card */}
      <div className="rounded-lg border bg-card p-6">
        {/* Card header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{file.name}</span>
              <span className="text-sm text-muted-foreground font-mono">
                {file.version}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {file.app?.join(" / ")} · {file.cloud?.join(", ") || "—"} ·{" "}
              {file.category} · Submitted by {file.submittedBy ?? file.contributor}{" "}
              · {file.submittedAt ?? "—"}
            </div>
          </div>
          {file.status && (
            <Badge status={file.status} className="shrink-0">
              {file.status}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: file details + download */}
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-3">
              FILE DETAILS
            </p>
            <div className="rounded-lg border bg-background px-4 mb-4">
              <DetailRow label="File name" value={file.name} />
              <DetailRow label="Version (pending)" value={file.version} />
              <DetailRow label="Application" value={file.app?.join(", ")} />
              <DetailRow label="Cloud" value={file.cloud?.join(", ") || "—"} />
              <DetailRow label="Category" value={file.category} />
              <DetailRow
                label="Submitted by"
                value={`${file.submittedBy ?? file.contributor} · ${file.submittedAt ?? ""}`}
              />
            </div>

            {file.description && (
              <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm mb-4">
                <p className="font-semibold mb-1">Change notes from contributor:</p>
                <p className="text-muted-foreground leading-relaxed">
                  {file.description}
                </p>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!file.file}
              onClick={async () => {
                try {
                  const res = await fetch(file.file)
                  const blob = await res.blob()
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = file.name
                  a.click()
                  URL.revokeObjectURL(url)
                } catch {
                  window.open(file.file, "_blank")
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download file to review
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-1.5">
              Open in Excel/VS Code to inspect changes before deciding
            </p>
          </div>

          {/* Right: decision panel */}
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-3">
              YOUR DECISION
            </p>

            {decision ? (
              <Alert
                variant={decision === "approved" ? "default" : "destructive"}
                className="mb-4"
              >
                <AlertTitle className="capitalize font-semibold">
                  {decision === "approved" ? "Approved" : "Rejected"}
                </AlertTitle>
                <AlertDescription>
                  {decision === "approved"
                    ? "Your approval has been recorded."
                    : "File returned to contributor with your comment."}
                </AlertDescription>
              </Alert>
            ) : (
              <Textarea
                placeholder="Add a comment (required for rejection)…"
                className="resize-none min-h-28 mb-4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!isApprover}
              />
            )}

            {isApprover && !decision && (
              <>
                <Button
                  className="w-full mb-2"
                  onClick={handleApprove}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={!comment.trim()}
                  onClick={handleReject}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject — return to contributor
                </Button>
              </>
            )}

            <Separator className="my-4" />

            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-2">
              APPROVE → File receives version number, available for release
              tagging.
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-2">
              REJECT → File returned to contributor. Must fix and re-upload.
            </div>

            <Separator className="my-4" />

            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-3">
              OTHER APPROVERS
            </p>
            <OtherApprovers status={file.status} submittedAt={file.submittedAt} />
            <p className="text-xs text-muted-foreground mt-3">
              Approval is dynamic — any assigned approver can act independently.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
