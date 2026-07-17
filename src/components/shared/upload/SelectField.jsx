import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { withFormField } from "@/components/hoc/withFormField";

const SelectField = withFormField(function SelectControl({
  id,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  hasError = false,
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        className="w-full capitalize"
        aria-invalid={hasError}
      >
        <SelectValue placeholder={placeholder} className="capitalize" />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="capitalize">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

export { SelectField };
