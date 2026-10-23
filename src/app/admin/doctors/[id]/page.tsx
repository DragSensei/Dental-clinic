import { redirect } from "next/navigation";

export const instant = false;

type RouteProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: RouteProps) {
  const { id } = await params;
  redirect(`/admin/accounts/${id}`);
}
