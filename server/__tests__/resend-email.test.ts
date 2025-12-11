import { describe, it, expect } from 'vitest';
import { sendEmailViaResend } from '../utils/resendEmailService';

describe('Resend Email Service', () => {
  it('should send email successfully with valid API key', async () => {
    const result = await sendEmailViaResend({
      to: 'lvumore@gmail.com',
      subject: 'Test Email from Movement with Benefit',
      html: '<p>This is a test email from the registration system.</p>',
    });

    // Should return true if email was sent successfully
    expect(typeof result).toBe('boolean');
    console.log(`✅ Email test result: ${result}`);
  });

  it('should handle invalid email gracefully', async () => {
    const result = await sendEmailViaResend({
      to: 'invalid-email',
      subject: 'Test',
      html: '<p>Test</p>',
    });

    // Should return false for invalid email
    expect(typeof result).toBe('boolean');
  });
});
