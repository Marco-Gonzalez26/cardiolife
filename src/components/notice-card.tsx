import Link from 'next/link'
import { AppSection } from '@/components/app-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/** Aviso centrado con una acción (por ejemplo "no tienes permiso" o "falta un dato previo") */
export const NoticeCard = ({
  title,
  children,
  href,
  action
}: {
  title: string
  children: React.ReactNode
  href: string
  action: string
}) => (
  <AppSection>
    <Card className='mx-auto w-full max-w-xl rounded-2xl shadow-sm'>
      <CardContent className='space-y-4 py-4 text-center'>
        <h1 className='text-xl font-semibold'>{title}</h1>
        <p className='text-muted-foreground'>{children}</p>
        <Button asChild>
          <Link href={href}>{action}</Link>
        </Button>
      </CardContent>
    </Card>
  </AppSection>
)
