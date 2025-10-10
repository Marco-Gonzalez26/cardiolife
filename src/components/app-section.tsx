export const AppSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className='h-full flex flex-col items-center w-full p-6 '>
      {children}
    </section>
  )
}
