import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import { getTermsContact } from '@/lib/services/portal-service'
import { createClient } from '@/lib/supabase/server'
import { TERMS_LEGALLY_REVIEWED, TERMS_UPDATED_AT, buildTerms } from '@/lib/terms'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Términos y condiciones - Cardiolife' }

export default async function PortalTermsPage() {
  const supabase = createClient(await cookies())
  const sections = buildTerms(await getTermsContact(supabase))

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Términos y condiciones</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Última actualización: {TERMS_UPDATED_AT}
        </p>
      </div>

      {!TERMS_LEGALLY_REVIEWED && (
        <div
          role='note'
          className='rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-medium text-warning'>
          Borrador pendiente de revisión legal.
        </div>
      )}

      <div className='grid gap-6 lg:grid-cols-[16rem_1fr]'>
        <nav aria-label='En esta página' className='lg:sticky lg:top-24 lg:self-start'>
          <Card className='rounded-2xl shadow-sm'>
            <CardContent>
              <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                En esta página
              </p>
              <ol className='space-y-1'>
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className='flex min-h-11 items-center rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring'>
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </nav>

        <Card className='rounded-2xl shadow-sm'>
          <CardContent className='space-y-8'>
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-titulo`}
                className={cn(
                  'scroll-mt-24 space-y-2',
                  section.id === 'emergencias' &&
                    'rounded-xl border border-destructive/30 bg-destructive/5 p-4'
                )}>
                <h2 id={`${section.id}-titulo`} className='text-lg font-semibold'>
                  {index + 1}. {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className='max-w-[70ch] leading-relaxed text-muted-foreground'>
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
