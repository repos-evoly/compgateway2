// i18n.ts — next-intl without middleware; locale comes from [locale] segment.
import {getRequestConfig} from 'next-intl/server';

const LOCALES = ['en', 'ar'] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = 'ar';

export default getRequestConfig(async ({locale}) => {
  const effectiveLocale: Locale = (LOCALES as readonly string[]).includes(locale as string)
    ? (locale as Locale)
    : DEFAULT_LOCALE;

  const messages = (await import(`./messages/${effectiveLocale}.json`)).default;

  return {
    locale: effectiveLocale,
    messages
  };
});
