import { et } from "./locales/et.ts";

export type TranslationKey = keyof typeof et;
export type Dictionary = { [Key in TranslationKey]: string };
// Add new dictionaries here; their keys must match the Estonian dictionary.
const dictionaries = { et } satisfies Record<string, Dictionary>;
export type Locale = keyof typeof dictionaries;
export const defaultLocale: Locale = "et";
export const currentLocale: Locale = defaultLocale;

type Placeholders<Text extends string> = Text extends `${string}{${infer Name}}${infer Rest}`
  ? Name | Placeholders<Rest> : never;
type Arguments<Key extends TranslationKey> = [Placeholders<(typeof et)[Key]>] extends [never]
  ? [] : [values: Record<Placeholders<(typeof et)[Key]>, string | number>];

// Explicit locale selection works on the server and client without mutable global state.
// A future language selector can supply its locale through routing or React context.
export function createTranslator(locale: Locale) {
  return function translate<Key extends TranslationKey>(key: Key, ...args: Arguments<Key>): string {
    const template: string = dictionaries[locale][key];
    const values = args[0] as Record<string, string | number> | undefined;
    return template.replace(/\{(\w+)\}/g, (_, name: string) => String(values?.[name] ?? `{${name}}`));
  };
}

export const t = createTranslator(currentLocale);
