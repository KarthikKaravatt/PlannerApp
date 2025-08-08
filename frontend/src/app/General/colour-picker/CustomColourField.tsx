import type { ColorFieldProps, ValidationResult } from "react-aria-components";
import {
  ColorField,
  FieldError,
  Input,
  Label,
  Text,
} from "react-aria-components";

interface MyColorFieldProps extends ColorFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function CustomColorField({
  label,
  description,
  errorMessage,
  ...props
}: MyColorFieldProps) {
  return (
    <ColorField {...props}>
      {label && <Label>{label}</Label>}
      <Input />
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
    </ColorField>
  );
}
