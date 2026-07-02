import { AppSection } from "@/components/app-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <AppSection>
      <div className='space-y-6 w-full mx-auto'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold'>
            This is the recipe page
          </h1>
          <Button>
            <Link href={'/dashboard/recipes/new'}>Nueva Receta</Link>
          </Button>
        </div>
      </div>
    </AppSection>
  )
}