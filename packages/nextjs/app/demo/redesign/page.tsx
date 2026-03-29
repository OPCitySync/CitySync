import { redirect } from "next/navigation";

type DemoRedesignPageProps = {
  searchParams?: Promise<{
    role?: string | string[];
  }>;
};

export default async function DemoRedesignPage({ searchParams }: DemoRedesignPageProps) {
  const params = await searchParams;
  const role = Array.isArray(params?.role) ? params.role[0] : params?.role;

  if (role) {
    redirect(`/app?role=${encodeURIComponent(role)}`);
  }

  redirect("/app");
}
