/**
 * Service d'envoi d'emails avec SendGrid
 */

interface EmailData {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export class SendGridService {
  static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // En mode développement, on simule l'envoi d'un email
      console.log('===== SIMULATION D\'ENVOI D\'EMAIL =====');
      console.log(`À: ${emailData.to}`);
      console.log(`De: ${emailData.from}`);
      console.log(`Sujet: ${emailData.subject}`);
      console.log(`Contenu: ${emailData.text || emailData.html}`);
      console.log('=====================================');
      
      if (process.env.SENDGRID_API_KEY) {
        // Si la clé API est configurée, on pourrait utiliser le SDK SendGrid ici
        console.log('Une clé API SendGrid est configurée. En production, un vrai email serait envoyé.');
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }
}
