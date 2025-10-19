import { MyTestDocument } from '@/components/pdfs/test-pdf'

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from '@/components/ui/card'
import PDFRenderer from '@/components/pdfs/pdf-renderer'
import { AppSection } from '@/components/app-section'

export default function Page() {
  return (
    <AppSection>
      <div className='w-full mx-auto h-full'>
        <Card className='w-full h-full'>
          <CardContent className='w-full h-full'>
            <PDFRenderer>
              <MyTestDocument patientName='Ana Testeo'/>
            </PDFRenderer>
          </CardContent>
        </Card>
      </div>
    </AppSection>
  )
}
