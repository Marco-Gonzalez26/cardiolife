import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDate(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

export function formatDate(date: string | Date) {
  if (!date) return ''

  const str = typeof date === 'string' ? date : date.toISOString().split('T')[0]
  const [year, month, day] = str.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}