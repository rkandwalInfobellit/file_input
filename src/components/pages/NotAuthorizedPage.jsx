import headerLogo from "@/assets/amd-header-logo.svg"
import { ROUTES } from "@/lib/routes"

export default function NotAuthorizedPage() {
  const ssoUrl = `${import.meta.env.VITE_COMMON_SERVICE_URL}?appName=IFG`

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8">
        <img src={headerLogo} alt="AMD logo" width={100} />
      </div>

      <div className="w-full max-w-md rounded-lg border border-border bg-card p-10 shadow-sm text-center">
        <h1 className="mb-3 text-2xl font-semibold text-foreground">
          You are not logged in
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Please log in to access this application.
        </p>

        <a
          href={ssoUrl}
          className="inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Click here to login
        </a>

        <div className="mt-6 border-t border-border pt-5 text-xs text-muted-foreground">
          Internal AMD team?{" "}
          <a
            href={ROUTES.LOGIN}
            className="font-medium text-primary hover:underline"
          >
            Use internal login
          </a>
        </div>
      </div>

      <p className="mt-8 max-w-md text-center text-xs text-muted-foreground">
        <strong>Important Notice:</strong> Before migrating to an AMD EPYC™
        processor-based cloud instance, you must verify that such migration is
        covered in the agreement between you and your cloud service provider.
        For further assistance, please contact AMD sales at{" "}
        <a href="mailto:cloudsales@amd.com" className="underline">
          cloudsales@amd.com
        </a>
        .
      </p>
    </div>
  )
}
