import cron from 'node-cron'
import { ProjectService } from '@services'

export async function dailyCheck() {
  cron.schedule('0 0 * * *', () => {
    try {
      Promise.allSettled([
        ProjectService.generatePayments(),
        ProjectService.sendOverduePaymentsEmails(),
      ])
    } catch (error) {
      console.error(error)
    }
  })
}
