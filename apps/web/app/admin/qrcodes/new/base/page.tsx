import { createClient } from "@/lib/supabase/server";
import BaseQrCodeForm from "@/components/qrcode/BaseQrCodeForm";

export default async function NewBaseQrCodePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return <BaseQrCodeForm token={session?.access_token ?? ""} />;
}
