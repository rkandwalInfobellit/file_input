import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { loginWithCredentials, fetchUserInfo, setAuthCookies } from "@/lib/auth"
import { ROUTES } from "@/lib/routes"
import headerLogo from "@/assets/amd-header-logo.svg"

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function InternalLoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  async function onSubmit({ email, password }) {
    setIsLoading(true)
    try {
      const { jwtToken } = await loginWithCredentials(email, password)
      const userInfo = await fetchUserInfo(jwtToken)
      setAuthCookies(jwtToken, userInfo)
      toast.success("Logged in successfully")
      setTimeout(() => navigate(ROUTES.FILE_CATALOG), 800)
    } catch (err) {
      toast.error(err?.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8">
        <img src={headerLogo} alt="AMD logo" width={100} />
      </div>

      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-12 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-foreground">Log In</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Welcome to AMD Input File Generator — Internal Access
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="off"
                placeholder="Email"
                {...register("email")}
                className="rounded-none border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Password"
                  {...register("password")}
                  className="w-full rounded-none border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="h-[50px] w-full rounded-none bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 md:w-48"
            >
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </div>
        </form>

        <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          <strong>Important Notice:</strong> Before migrating to an AMD EPYC™
          processor-based cloud instance, you must verify that such migration is
          covered in the agreement between you and your cloud service provider.
          If AMD-based cloud instances are not covered in your agreement, please
          contact your cloud provider sales account manager. For further
          assistance, please contact AMD sales at{" "}
          <a href="mailto:cloudsales@amd.com" className="underline">
            cloudsales@amd.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
