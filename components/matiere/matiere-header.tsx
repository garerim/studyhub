"use client"

type MatiereHeaderProps = {
  name: string
}

export function MatiereHeader({ name }: MatiereHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h1 className="text-xl font-semibold">Matière - {name}</h1>
    </div>
  )
}
