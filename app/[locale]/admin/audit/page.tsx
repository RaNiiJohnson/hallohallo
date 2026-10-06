import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function AuditLogPage() {
  const t = await getTranslations("admin.audit");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed bg-card p-8 text-center">
        <div className="max-w-md">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-semibold">{t("pendingTitle")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("pendingDescription")}
          </p>
        </div>
      </div>
    </div>
  );
}
