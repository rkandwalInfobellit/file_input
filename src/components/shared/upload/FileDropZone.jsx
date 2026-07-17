import React from "react";
import { useController } from "react-hook-form";
import { Inbox } from "lucide-react";

export function FileDropZone({ control, errors }) {
  const {
    field: { onChange, value },
  } = useController({ name: "file", control });
  const hasError = !!errors?.file;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-14 text-center transition-colors ${hasError ? "border-destructive" : "border-border"}`}
      onDrop={(e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped) onChange(dropped);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <Inbox
        size={34}
        className={`mb-3 ${hasError ? "text-destructive" : "text-primary"}`}
      />
      {value instanceof File ? (
        <div className="font-semibold mb-1 text-sm">{value.name}</div>
      ) : (
        <div className="font-semibold mb-1">Drop file here</div>
      )}
      <label className="text-sm font-medium mb-2 cursor-pointer text-primary">
        {value instanceof File ? "Replace file" : "or browse"}
        <input
          type="file"
          className="hidden"
          accept=".xlsx,.json,.csv,.pdf,.h5"
          onChange={(e) => {
            const selected = e.target.files[0];
            if (selected) onChange(selected);
          }}
        />
      </label>
      <div className="text-xs text-muted-foreground">
        .xlsx · .json · .csv · .pdf · .h5 · max 200 MB
      </div>
    </div>
  );
}
