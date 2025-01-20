import { ProjectService } from "@services";

export async function handleDailyCheck() {
  console.log("Running cron job!");

  try {
    Promise.allSettled([
      ProjectService.generatePayments(),
      ProjectService.sendOverduePaymentsEmails(),
    ]);
  } catch (error: any) {
    console.error(error);
  }
}
