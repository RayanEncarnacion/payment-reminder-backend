import 'dotenv/config'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER!,
    pass: process.env.EMAIL_PASSWORD!,
  },
})

type ReminderOptions = {
  project: string
  client: string
  amount: string
  dueDate: string
}

class MailService {
  async send(options: ReminderOptions) {
    transporter.sendMail(
      {
        to: process.env.EMAIL_RECEIVER!,
        from: process.env.EMAIL_SENDER!,
        subject: 'Reminder of payment of project: ' + options.project,
        html: getHtmlTemplate(options),
      },
      (error, info) => {
        if (error) {
          console.error('Error sending email:', error)
        } else {
          console.log('Email sent:', info.response)
        }
      },
    )
  }
}

// ! This is just to avoid adding the text inside de send function
function getHtmlTemplate({
  project,
  client,
  amount,
  dueDate,
}: ReminderOptions) {
  return `
            <!DOCTYPE html>
            <html>
    
            <head>
                <meta name="viewport" content="width=device-width">
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <style type="text/css">
                    html,
                    body {
                        padding: 0;
                        margin: 0;
                        font-weight: 400;
                        color: #63636;
                        font-family: Tahoma, Helvetica, sans-serif;
                    }
    
                    .body {
                        padding: 50px 16px;
                    }
    
                    .bg-gray {
                        background-color: #F5F8FA;
                    }
    
                    .bg-white {
                        background-color: white;
                    }
    
                    .container {
                        background-color: white;
                        padding: 32px;
                        border-radius: 16px;
                        width: 100%;
                        max-width: 600px;
                        margin: auto;
                        padding-top: 16px;
                    }
    
                    .content-body {
                        min-height: 150px;
                        display: block;
                    }
    
                    .header {
                        padding-bottom: 16px;
                        border-bottom: solid 1px #F5F8FA;
                        margin-bottom: 16px;
                        display: block;
                    }
    
                    .header img {
                        margin: auto;
                        max-width: 208px;
                        display: grid;
                        place-content: center;
                    }
    
                    h3,
                    h1,
                    h2 {
                        margin: 0 !important;
                    }
    
                    h3 {
                        font-size: 24px !important;
                    }
    
                    p {
                        font-size: 16px !important;
                        line-height: 24px;
                    }
    
                    .button {
                        text-decoration: none !important;
                        color: #FFFFFF !important;
                        border: none !important;
                        display: inline-block;
                        background: #003579 !important;
                        font-weight: bold;
                        font-style: normal;
                        width: auto;
                        text-align: center;
                        font-size: 14px;
                        border-radius: 5px;
                        padding: 16px 24px;
                    }
    
                    .signature {
                        margin-top: 16px;
                        display: block;
                    }
    
                    .justify__text {
                        text-align: justify;
                        text-justify: inter-word;
                    }
                    .footer,
                    .footer p {
                        font-size: 12px;
                    }
                </style>
            </head>
    
            <body class="bg-gray">
                <div class="body">
                    <table class="container">
                        <tr class="content header"> 
                            <td class="content-body">
                                <table>
                                    <tr>
                                        <td>
                                            <h3>Payment reminder</h3>
                                        </td>
                                    </tr>
    
                                    <tr>
                                        <td>
                                            <p class="justify__text">
                                              <ul style="padding-left: 0">
                                                <li><p><strong>Client:</strong> ${client}</p></li>
                                                <li><p><strong>Project:</strong> ${project}</p></li>
                                                <li><p><strong>Amount Due:</strong> ${amount}</p></li>
                                                <li><p><strong>Payment Due Date:</strong> ${dueDate}</p></li>
                                              </ul>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            </body>
            </html>
      `
}

export default new MailService()
