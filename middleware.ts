export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/report/:path*",
    "/settings/:path*",
  ],
}
