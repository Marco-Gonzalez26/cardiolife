/** Dato con su rótulo para las fichas del portal; no se muestra si no hay valor */
export const Field = ({ label, value }: { label: string; value: string | null }) =>
  value ? (
    <div>
      <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <p className='whitespace-pre-line text-sm'>{value}</p>
    </div>
  ) : null
