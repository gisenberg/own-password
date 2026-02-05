import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Favicon } from "@/components/common/favicon";
import { FieldRow } from "./field-row";
import { PasswordField } from "./password-field";
import { UrlField } from "./url-field";
import { NotesSection } from "./notes-section";
import { useVaultStore } from "@/stores/vault-store";
import type { ItemField, SectionField } from "@/lib/opvault";

export function ItemDetail() {
  const { selectedItemUuid, selectedItemDetail, decryptingDetail, items } =
    useVaultStore();

  if (!selectedItemUuid) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Select an item to view its details
      </div>
    );
  }

  const item = items.find((i) => i.uuid === selectedItemUuid);

  if (decryptingDetail || !selectedItemDetail) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-10 w-10 rounded" />
          <div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-1 h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const detail = selectedItemDetail;

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5">
        <Favicon url={item?.url} size={40} />
        <div>
          <h2 className="text-lg font-semibold">{item?.title}</h2>
          {item?.ainfo && (
            <p className="text-sm text-muted">{item.ainfo}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* URL from overview */}
      {item?.url && <UrlField label="Website" value={item.url} />}

      {/* Fields */}
      {detail.fields?.map((field: ItemField) => {
        if (!field.value) return null;

        const label = getFieldLabel(field);

        if (field.type === "P" || field.designation === "password") {
          return (
            <PasswordField
              key={field.name}
              label={label}
              value={field.value}
              fieldId={`${detail.uuid}-${field.name}`}
            />
          );
        }

        return <FieldRow key={field.name} label={label} value={field.value} />;
      })}

      {/* Sections */}
      {detail.sections?.map((section) => {
        const visibleFields = section.fields?.filter(
          (f: SectionField) => f.v != null && f.v !== ""
        );
        if (!visibleFields?.length) return null;

        return (
          <div key={section.name}>
            {section.title && (
              <>
                <Separator />
                <div className="px-6 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  {section.title}
                </div>
              </>
            )}
            {visibleFields.map((field: SectionField) => {
              const value = String(field.v);
              if (field.k === "concealed") {
                return (
                  <PasswordField
                    key={field.n}
                    label={field.t || field.n}
                    value={value}
                    fieldId={`${detail.uuid}-${field.n}`}
                  />
                );
              }
              return (
                <FieldRow
                  key={field.n}
                  label={field.t || field.n}
                  value={value}
                />
              );
            })}
          </div>
        );
      })}

      {/* Notes */}
      {detail.notesPlain && (
        <>
          <Separator />
          <NotesSection notes={detail.notesPlain} />
        </>
      )}
    </div>
  );
}

function getFieldLabel(field: ItemField): string {
  if (field.designation === "username") return "Username";
  if (field.designation === "password") return "Password";
  return field.name || field.designation || "Field";
}
