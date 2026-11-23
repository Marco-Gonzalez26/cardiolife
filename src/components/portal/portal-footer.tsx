import Link from 'next/link'

/** Pie del portal: aviso de emergencia siempre a la vista y acceso a los términos */
export const PortalFooter = () => (
  <footer className='mx-auto w-full max-w-5xl space-y-3 px-4 pb-8 pt-2 text-sm text-muted-foreground md:px-8'>
    <p>
      Si tiene dolor en el pecho o falta de aire intensa, llame al{' '}
      <a
        href='tel:911'
        className='inline-flex min-h-11 items-center font-semibold text-foreground underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-ring'>
        911
      </a>
      .
    </p>
    <div className='flex flex-wrap items-center justify-between gap-2 border-t pt-3'>
      <span>© {new Date().getFullYear()} Cardiolife</span>
      <Link
        href='/portal/terminos'
        className='inline-flex min-h-11 items-center underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring'>
        Términos y condiciones
      </Link>
    </div>
  </footer>
)
