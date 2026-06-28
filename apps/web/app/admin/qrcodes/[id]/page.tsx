import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EditQrCodeClient from "@/components/qrcode/EditQrCodeClient";

export default async function EditQrCodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  return <EditQrCodeClient token={session.access_token} id={id} />;
}
