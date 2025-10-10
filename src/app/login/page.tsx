'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { loginWithCode } from '@/lib/services/auth-service'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader
} from '@/components/ui/card'
import { Eye, EyeClosed } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
const loginFormSchema = z.object({
  email: z.string().email({ message: 'Por favor ingresa un email válido' }),
  password: z.string().min(8, {
    message: 'La contraseña debe tener al menos 8 caracteres'
  })
})

export default function Login() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    setLoading(true)
    const { email, password } = values
    const { user, error: loginError } = await loginWithCode(email, password)

    if (loginError) {
      setLoading(false)
      toast.error(loginError)
      return
    }

    if (user) {
      setLoading(false)
      toast.success('Sesion iniciada correctamente, redirigiendo...')
      router.push('/dashboard')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='absolute top-0 -z-10 h-full w-full bg-white'>
        <div className='absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(109,147,244,0.5)] opacity-50 blur-[80px]'></div>
      </div>
      <Card className='max-w-md w-full '>
        <CardHeader>
          <h2 className='text-xl font-bold text-neutral-900 '>
            Ingresar a Cardiolife
          </h2>

          <CardDescription className='text-sm'>
            Para continuar con el ingreso, por favor ingrese sus credenciales de
            acceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='grid gap-6 '
              onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                name='email'
                render={({ field }) => (
                  <FormItem className='col-span-full'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='Correo electrónico'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='password'
                render={({ field }) => (
                  <FormItem className='col-span-full'>
                    <FormLabel>Código de acceso</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Código de acceso'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' disabled={loading} className='w-full'>
                Ingresar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
