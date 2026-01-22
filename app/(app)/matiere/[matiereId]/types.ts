export type Note = {
  id: string
  note: number
  comment: string | null
  coefficient: number
  date: string
}

export type File = {
  id: string
  name: string
  url: string
  size: number
  mimeType: string
  createdAt: string
}

export type Quiz = {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  isAIGenerated: boolean
  questions: {
    id: string
    question: string
    type: string
    points: number
    order: number
    answers: {
      id: string
      text: string
      isCorrect: boolean
      order: number
    }[]
  }[]
  attempts: {
    id: string
    score: number
    totalPoints: number
    completedAt: string
    answers: string
  }[]
  _count: {
    attempts: number
  }
}
