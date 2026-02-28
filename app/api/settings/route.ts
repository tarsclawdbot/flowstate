import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  })

  return NextResponse.json(
    settings || {
      targetDeepHours: 4,
      timezone: "America/Chicago",
      emailReports: true,
    }
  )
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...body },
    update: body,
  })

  return NextResponse.json(settings)
}
