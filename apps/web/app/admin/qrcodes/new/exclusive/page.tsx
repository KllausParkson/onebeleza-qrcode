import { createClient } from "@/lib/supabase/server";
import ExclusiveQrCodeForm from "@/components/qrcode/ExclusiveQrCodeForm";

export default async function NewExclusiveQrCodePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return <ExclusiveQrCodeForm token={session?.access_token ?? ""} />;
}
