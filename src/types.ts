export type PaymentData = {
  id: number
  deleted: number
  createdAt: Date | null
  amount: string
  projectId: number
  dueDate: Date
  payed: number
  isDue: boolean
  project: {
    id: number
    name: string
    active: number
    deleted: number
  }
  client: {
    id: number
    name: string
    email: string
    active: number
    deleted: number
  }
}
