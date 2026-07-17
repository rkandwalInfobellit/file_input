import React from "react";
import { useController } from "react-hook-form";
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { FieldLabel, FieldError, Field } from "@/components/ui/field";
import { APPROVER_OPTIONS } from "./uploadSchema";

export function ApproverField({ control, errors, disabled }) {
  const {
    field: { value, onChange },
  } = useController({ name: "approvers", control });

  const anchor = useComboboxAnchor();
  const hasError = !!errors?.approvers;

  return (
    <Field className="mb-6">
      <FieldLabel
        className="text-[11px] font-semibold tracking-wider capitalize"
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        APPROVERS · PICK ONE OR MORE
      </FieldLabel>
      <Combobox
        multiple
        value={value}
        onValueChange={disabled ? undefined : onChange}
        disabled={disabled}
      >
        <ComboboxChips ref={anchor}>
          {value.map((v) => {
            const opt = APPROVER_OPTIONS.find((o) => o.value === v);
            return (
              <ComboboxChip key={v} value={v}>
                {opt?.label ?? v}
              </ComboboxChip>
            );
          })}
          <ComboboxChipsInput
            aria-invalid={hasError}
            placeholder={
              disabled
                ? "Select application, cloud & category first"
                : value.length === 0
                  ? "Select approver"
                  : ""
            }
            readOnly
            disabled={disabled}
          />
        </ComboboxChips>
        {!disabled && (
          <ComboboxContent anchor={anchor.current} align="start">
            <ComboboxList>
              {APPROVER_OPTIONS.map((o) => (
                <ComboboxItem key={o.value} value={o.value}>
                  {o.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        )}
      </Combobox>
      <FieldError errors={hasError ? [errors.approvers] : []} />
    </Field>
  );
}
