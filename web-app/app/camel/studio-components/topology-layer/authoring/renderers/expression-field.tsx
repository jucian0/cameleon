import React from "react";
import { TextField } from "app/components/ui/text-field";
import { Textarea } from "app/components/ui/textarea";
import {
  Select,
  SelectList,
  SelectOption,
  SelectTrigger,
} from "app/components/ui/select";
import type { FieldRendererProps } from "../types";
import { isPlainObject, parseObjectValue, prettyJson } from "../utils";

const PREFERRED_EXPRESSION_LANGUAGES = [
  "simple",
  "jsonpath",
  "header",
  "exchangeProperty",
  "constant",
  "xpath",
  "method",
  "ref",
] as const;
const PREFERRED_LANGUAGE_SET = new Set<string>(PREFERRED_EXPRESSION_LANGUAGES);

function getExpressionLanguages(propertyOptions: string[], value: unknown) {
  const valueLanguage =
    isPlainObject(value) && Object.keys(value).length === 1
      ? Object.keys(value)[0]
      : undefined;

  const ordered = [
    ...PREFERRED_EXPRESSION_LANGUAGES.filter((language) =>
      propertyOptions.includes(language),
    ),
    ...propertyOptions.filter(
      (language) => !PREFERRED_LANGUAGE_SET.has(language),
    ),
  ];

  if (valueLanguage && !ordered.includes(valueLanguage)) {
    ordered.unshift(valueLanguage);
  }

  return ordered.length > 0 ? ordered : ["simple"];
}

function getExpressionValue(
  value: unknown,
  options: string[],
): { language: string; expression: unknown; usesFallback: boolean } {
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 1) {
      const [language] = keys;
      if (language) {
        return {
          language,
          expression: value[language],
          usesFallback:
            isPlainObject(value[language]) || Array.isArray(value[language]),
        };
      }
    }

    return {
      language: keys[0] ?? options[0] ?? "simple",
      expression: value,
      usesFallback: true,
    };
  }

  return {
    language: options[0] ?? "simple",
    expression: typeof value === "string" ? value : "",
    usesFallback: false,
  };
}

export function ExpressionField({
  label,
  description,
  errorMessage,
  property,
  value,
  onChange,
}: FieldRendererProps) {
  const expressionOptions = React.useMemo(
    () => getExpressionLanguages(property.oneOf ?? [], value),
    [property.oneOf, value],
  );
  const { language, expression, usesFallback } = React.useMemo(
    () => getExpressionValue(value, expressionOptions),
    [expressionOptions, value],
  );
  const expressionIsComplex =
    usesFallback || isPlainObject(expression) || Array.isArray(expression);
  const locksLanguageSelection =
    isPlainObject(value) && Object.keys(value).length > 1;

  return (
    <div
      className={`space-y-3 rounded-lg border p-3 ${
        errorMessage ? "border-danger/40 bg-danger/5" : "border-border"
      }`}
    >
      <Select
        selectedKey={language}
        isDisabled={locksLanguageSelection}
        onSelectionChange={(nextLanguage) => {
          const selectedLanguage =
            nextLanguage?.toString() || expressionOptions[0] || "simple";

          if (usesFallback || locksLanguageSelection) {
            onChange({
              [selectedLanguage]: expression,
            });
            return;
          }

          onChange({
            [selectedLanguage]: expression,
          });
        }}
        label={`${label} Language`}
        description={
          locksLanguageSelection
            ? "Complex expression shape detected. Keep editing in advanced JSON mode."
            : description
        }
      >
        <SelectTrigger />
        <SelectList>
          {expressionOptions.map((option) => (
            <SelectOption key={option} id={option}>
              {option}
            </SelectOption>
          ))}
        </SelectList>
      </Select>

      {expressionIsComplex ? (
        <Textarea
          label={`${label} Value`}
          description="Advanced JSON fallback for complex expression payloads."
          errorMessage={errorMessage}
          placeholder="{}"
          value={prettyJson(expression)}
          onChange={(nextValue) =>
            onChange({
              [language]: parseObjectValue(nextValue),
            })
          }
        />
      ) : (
        <TextField
          label={`${label} Value`}
          errorMessage={errorMessage}
          value={expression?.toString() || ""}
          onChange={(nextValue) =>
            onChange({
              [language]: nextValue,
            })
          }
        />
      )}
    </div>
  );
}
