import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

/**
 * HOC that wraps any controlled input component with Field + FieldLabel + Controller + FieldError.
 *
 * Usage:
 *   const SelectField = withFormField(({ value, onChange, options, placeholder }) => (
 *     <Select value={value} onValueChange={onChange}>
 *       <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
 *       <SelectContent>
 *         {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
 *       </SelectContent>
 *     </Select>
 *   ));
 *
 *   <SelectField
 *     name="cloud"
 *     control={control}
 *     label="CLOUD"
 *     errors={errors}
 *     placeholder="Select cloud"
 *     options={cloudOptions}
 *   />
 *
 * Props consumed by the HOC:
 *   - name      {string}   react-hook-form field name
 *   - control   {object}   from useForm()
 *   - label     {string}   displayed above the field
 *   - errors    {object}   formState.errors from useForm()
 *   - className {string}   applied to the outer Field wrapper
 *
 * All other props are forwarded to the wrapped component alongside
 * the injected `value` and `onChange` from Controller.
 */
export function withFormField(WrappedComponent) {
  function FormField({ name, control, label, errors, className, ...rest }) {
    const fieldError = errors?.[name];
    return (
      <Field className={className}>
        {label && (
          <FieldLabel htmlFor={name} className="text-[11px] font-semibold tracking-wider capitalize">
            {label}
          </FieldLabel>
        )}
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <WrappedComponent
              id={name}
              value={field.value}
              onChange={field.onChange}
              {...rest}
            />
          )}
        />
        <FieldError errors={fieldError ? [fieldError] : []} />
      </Field>
    );
  }

  FormField.displayName = `withFormField(${WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"})`;
  return FormField;
}
