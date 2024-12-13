import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

const locales = ['en', 'ar'];

export default getRequestConfig(async () => {
  const headersList = await headers();
  const locale = headersList.get('X-NEXT-INTL-LOCALE') || 'en';

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
