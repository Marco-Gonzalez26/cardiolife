'use client'

import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

/** Campos de formulario compartidos (historia clínica, evoluciones…), genéricos sobre react-hook-form */
type BaseProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  name: Path<T>
  label: string
}

export function TextAreaField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  className
}: BaseProps<T> & { placeholder?: string; className?: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className={cn('min-h-[100px] resize-none', className)}
              {...field}
              value={(field.value as string) ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function InputField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder
}: BaseProps<T> & { placeholder?: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              value={(field.value as string) ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function SelectField<T extends FieldValues>({
  form,
  name,
  label,
  options,
  placeholder = 'Seleccionar'
}: BaseProps<T> & { options: string[]; placeholder?: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            value={(field.value as string) || undefined}
            onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

/** Tarjeta de signo vital: etiqueta, valor grande con subrayado y unidad */
export function VitalTile<T extends FieldValues>({
  form,
  name,
  label,
  unit,
  placeholder,
  readOnly
}: BaseProps<T> & { unit: string; placeholder?: string; readOnly?: boolean }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className='gap-1 rounded-lg border bg-background p-3'>
          <FormLabel className='text-xs font-medium text-muted-foreground'>
            {label}
          </FormLabel>
          <div className='flex items-baseline gap-1'>
            <FormControl>
              <Input
                placeholder={placeholder}
                readOnly={readOnly}
                className='h-8 rounded-none border-0 border-b bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:border-primary focus-visible:ring-0 dark:bg-transparent'
                {...field}
                value={(field.value as string) ?? ''}
              />
            </FormControl>
            <span className='text-xs text-muted-foreground'>{unit}</span>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
