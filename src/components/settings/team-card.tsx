'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { KeyRound, Loader2, UserPlus } from 'lucide-react'
import {
  createSecretary,
  removeSecretary,
  resetSecretaryPassword
} from '@/actions/team'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/format-date'
import type { SecretaryItem } from '@/lib/services/team-service'

type ActionResult = { error: string } | { success: true }

/** Diálogo con campos de texto que envía a una acción del servidor */
const FormDialog = ({
  trigger,
  title,
  description,
  fields,
  submitLabel,
  onSubmit
}: {
  trigger: React.ReactNode
  title: string
  description: string
  fields: {
    name: string
    label: string
    type?: string
    autoComplete?: string
  }[]
  submitLabel: string
  onSubmit: (values: Record<string, string>) => Promise<ActionResult>
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const result = await onSubmit(values)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Listo')
      setValues({})
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {fields.map((field) => (
            <div key={field.name} className='space-y-2'>
              <Label htmlFor={`team-${field.name}`} className='font-semibold'>
                {field.label}
              </Label>
              <Input
                id={`team-${field.name}`}
                type={field.type ?? 'text'}
                autoComplete={field.autoComplete}
                value={values[field.name] ?? ''}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.name]: event.target.value
                  }))
                }
                className='h-11'
              />
            </div>
          ))}
          <Button
            type='submit'
            disabled={loading}
            className='h-11 w-full font-semibold'>
            {loading && <Loader2 className='animate-spin' />}
            {submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface TeamCardProps {
  secretaries: SecretaryItem[]
  /** Si falta SUPABASE_SERVICE_ROLE_KEY en el servidor no se pueden crear cuentas */
  adminConfigured: boolean
}

/** Cuentas de las secretarias del médico: crear, cambiar contraseña y quitar acceso */
export const TeamCard = ({ secretaries, adminConfigured }: TeamCardProps) => (
  <div className='space-y-4'>
    {!adminConfigured && (
      <p className='rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900'>
        Para crear cuentas hay que configurar <code>SUPABASE_SERVICE_ROLE_KEY</code>{' '}
        en el servidor (.env.local y en producción). Nunca la compartas.
      </p>
    )}

    {secretaries.length === 0 ? (
      <p className='text-sm text-muted-foreground'>
        Aún no tienes secretarias. Ellas pueden registrar pacientes, agendar citas y
        dejar historias y evoluciones como borrador para que las completes.
      </p>
    ) : (
      <ul className='divide-y rounded-lg border'>
        {secretaries.map((secretary) => (
          <li
            key={secretary.id}
            className='flex flex-wrap items-center justify-between gap-3 p-3'>
            <div className='min-w-0'>
              <p className='truncate font-semibold'>{secretary.fullName}</p>
              <p className='truncate text-sm text-muted-foreground'>
                {secretary.email} · Creada {formatDate(secretary.createdAt)}
                {secretary.lastSignInAt
                  ? ` · Último acceso ${formatDate(secretary.lastSignInAt)}`
                  : ' · Aún no ha ingresado'}
              </p>
            </div>
            <div className='flex items-center gap-1'>
              <FormDialog
                trigger={
                  <Button variant='ghost' size='sm' className='gap-1.5'>
                    <KeyRound className='size-4' />
                    Contraseña
                  </Button>
                }
                title='Nueva contraseña'
                description={`Define una contraseña nueva para ${secretary.fullName}. Compártela por un canal seguro.`}
                fields={[
                  {
                    name: 'password',
                    label: 'Contraseña (mínimo 10 caracteres)',
                    type: 'password',
                    autoComplete: 'new-password'
                  }
                ]}
                submitLabel='Cambiar contraseña'
                onSubmit={(values) =>
                  resetSecretaryPassword(secretary.id, values.password ?? '')
                }
              />
              <ConfirmDeleteDialog
                title='Quitar acceso'
                triggerLabel='Quitar acceso'
                successMessage='Acceso eliminado'
                description={
                  <>
                    Se eliminará la cuenta de <strong>{secretary.fullName}</strong>. Lo
                    que registró (pacientes, borradores) se conserva.
                  </>
                }
                onConfirm={() => removeSecretary(secretary.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    )}

    <FormDialog
      trigger={
        <Button className='gap-2 font-semibold' disabled={!adminConfigured}>
          <UserPlus className='size-4' />
          Agregar secretaria
        </Button>
      }
      title='Agregar secretaria'
      description='Se crea su cuenta; al ingresar por primera vez deberá activar el autenticador de dos pasos.'
      fields={[
        { name: 'fullName', label: 'Nombre completo' },
        {
          name: 'email',
          label: 'Correo electrónico',
          type: 'email',
          autoComplete: 'off'
        },
        {
          name: 'password',
          label: 'Contraseña inicial (mínimo 10 caracteres)',
          type: 'password',
          autoComplete: 'new-password'
        }
      ]}
      submitLabel='Crear cuenta'
      onSubmit={(values) =>
        createSecretary({
          fullName: values.fullName ?? '',
          email: values.email ?? '',
          password: values.password ?? ''
        })
      }
    />
  </div>
)
