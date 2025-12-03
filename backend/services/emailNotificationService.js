/**
 * Email Notification Service
 * Handles parsing bank transaction notifications from emails
 */

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');

class EmailNotificationService {
  /**
   * Test email connection
   */
  static async testConnection(config) {
    try {
      if (config.provider === 'gmail') {
        return await this.testGmailConnection(config);
      } else if (config.provider === 'outlook') {
        return await this.testOutlookConnection(config);
      } else if (config.provider === 'imap') {
        return await this.testImapConnection(config);
      }
      throw new Error('Unsupported email provider');
    } catch (error) {
      throw new Error(`Email connection test failed: ${error.message}`);
    }
  }

  /**
   * Test Gmail connection using OAuth2
   */
  static async testGmailConnection(config) {
    // For production, you'd use OAuth2
    // This is a simplified version
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email,
        pass: config.password // Should be App Password for Gmail
      }
    });

    await transporter.verify();
    return { success: true, message: 'Gmail connection successful' };
  }

  /**
   * Test Outlook connection
   */
  static async testOutlookConnection(config) {
    const transporter = nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: config.email,
        pass: config.password
      }
    });

    await transporter.verify();
    return { success: true, message: 'Outlook connection successful' };
  }

  /**
   * Test IMAP connection
   */
  static async testImapConnection(config) {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: config.email,
        password: config.password,
        host: config.imapServer,
        port: config.imapPort,
        tls: true
      });

      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          imap.end();
          reject(err);
        } else {
          imap.end();
          resolve({ success: true, message: 'IMAP connection successful' });
        }
      });

      imap.openBox('INBOX', false, (err) => {
        if (err) reject(err);
      });
    });
  }

  /**
   * Fetch and parse bank transaction emails
   */
  static async fetchBankTransactions(config, bankName, limit = 50) {
    try {
      const imap = this.createImapConnection(config);
      const transactions = [];

      return new Promise((resolve, reject) => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            imap.end();
            reject(err);
            return;
          }

          // Search for emails from bank
          const searchCriteria = [
            ['FROM', bankName],
            ['SINCE', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)] // Last 90 days
          ];

          imap.search(searchCriteria, (err, results) => {
            if (err) {
              imap.end();
              reject(err);
              return;
            }

            if (!results || results.length === 0) {
              imap.end();
              resolve([]);
              return;
            }

            const f = imap.fetch(results.slice(0, limit), { bodies: '' });

            f.on('message', (msg, seqno) => {
              simpleParser(msg, async (err, parsed) => {
                if (err) {
                  console.error('Parse error:', err);
                  return;
                }

                try {
                  const transaction = this.parseTransactionFromEmail(
                    parsed,
                    bankName
                  );
                  if (transaction) {
                    transactions.push(transaction);
                  }
                } catch (parseErr) {
                  console.error('Transaction parse error:', parseErr);
                }
              });
            });

            f.on('error', (err) => {
              imap.end();
              reject(err);
            });

            f.on('end', () => {
              imap.end();
              resolve(transactions);
            });
          });
        });

        imap.on('error', reject);
        imap.on('end', () => {
          // Connection closed
        });
      });
    } catch (error) {
      throw new Error(`Failed to fetch bank transactions: ${error.message}`);
    }
  }

  /**
   * Create IMAP connection based on provider
   */
  static createImapConnection(config) {
    let imapConfig = {
      user: config.email,
      password: config.password,
      tls: true
    };

    if (config.provider === 'gmail') {
      imapConfig.host = 'imap.gmail.com';
      imapConfig.port = 993;
    } else if (config.provider === 'outlook') {
      imapConfig.host = 'imap-mail.outlook.com';
      imapConfig.port = 993;
    } else if (config.provider === 'yahoo') {
      imapConfig.host = 'imap.mail.yahoo.com';
      imapConfig.port = 993;
    } else if (config.provider === 'imap') {
      imapConfig.host = config.imapServer;
      imapConfig.port = config.imapPort;
    }

    return new Imap(imapConfig);
  }

  /**
   * Parse transaction from email content
   * Supports common bank email formats
   */
  static parseTransactionFromEmail(emailData, bankName) {
    try {
      const text = emailData.text || '';
      const subject = emailData.subject || '';
      const html = emailData.html || '';
      const content = (text + ' ' + subject + ' ' + html).toLowerCase();

      // Common patterns for bank notifications
      const patterns = {
        // Amount patterns: $1,234.56 or 1234.56 or 1,234.56 VND
        amount: /(?:amount|balance|transferred|received|paid|deducted)[\s:]*(?:\$|₫)?[\s]*([0-9,]+\.?\d*)/gi,
        
        // Date patterns: YYYY-MM-DD, DD/MM/YYYY, etc.
        date: /(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4})/gi,
        
        // Transaction type
        type: /(withdrawal|deposit|transfer|payment|received|sent|debit|credit)/gi,
        
        // Description/Merchant
        description: /(?:merchant|description|reference|details)[\s:]*([^\n\r]{10,100})/gi,
        
        // Account number (last 4 digits)
        accountNumber: /(?:account|card)[\s:]*\*+(\d{4})/gi
      };

      // Extract data
      const amountMatch = patterns.amount.exec(content);
      const dateMatch = patterns.date.exec(content);
      const typeMatch = patterns.type.exec(content);
      const descriptionMatch = patterns.description.exec(content);
      const accountMatch = patterns.accountNumber.exec(content);

      if (!amountMatch) {
        return null; // No amount found, skip
      }

      const amount = parseFloat(
        amountMatch[1].replace(/[,$]/g, '').replace(/,/g, '')
      );

      if (isNaN(amount)) {
        return null;
      }

      return {
        date: dateMatch ? new Date(dateMatch[1]) : new Date(),
        amount: Math.abs(amount),
        type: typeMatch
          ? typeMatch[1].toLowerCase().includes('deposit') ||
            typeMatch[1].toLowerCase().includes('received') ||
            typeMatch[1].toLowerCase().includes('credit')
            ? 'deposit'
            : 'withdrawal'
          : 'transfer',
        description:
          descriptionMatch && descriptionMatch[1]
            ? descriptionMatch[1].trim().substring(0, 100)
            : `${bankName} Transaction`,
        status: 'pending',
        source: 'email',
        accountNumber: accountMatch ? accountMatch[1] : null,
        rawEmail: {
          subject: subject,
          from: emailData.from?.text || '',
          date: emailData.date
        }
      };
    } catch (error) {
      console.error('Error parsing transaction:', error);
      return null;
    }
  }

  /**
   * Advanced parsing for specific banks
   * Add bank-specific patterns here
   */
  static parseTransactionForBank(emailData, bankName) {
    const bankNameLower = bankName.toLowerCase();

    // Timo Digital Bank (BVBank) specific parsing
    if (bankNameLower.includes('timo') || bankNameLower.includes('bvbank')) {
      return this.parseTimoTransaction(emailData);
    }

    // Vietcombank specific parsing
    if (bankNameLower.includes('vietcombank')) {
      return this.parseVietcombankTransaction(emailData);
    }

    // Techcombank specific parsing
    if (bankNameLower.includes('techcombank')) {
      return this.parseTechcombankTransaction(emailData);
    }

    // Default parsing
    return this.parseTransactionFromEmail(emailData, bankName);
  }

  /**
   * Parse Timo Digital Bank transaction
   * Example: "Your account ****1234 has been credited with 500,000 VND"
   */
  static parseTimoTransaction(emailData) {
    const text = emailData.text || '';
    const subject = emailData.subject || '';

    // Timo patterns
    const amountPattern = /(?:credited|debited|transferred)[\s]*(?:with|of)?[\s]*([0-9,]+)[\s]*(?:VND|đ)?/i;
    const datePattern = /(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/;
    const accountPattern = /\*{4}(\d{4})/;
    const typePattern = /(credited|debited|transferred)/i;

    const amountMatch = amountPattern.exec(text);
    const dateMatch = datePattern.exec(text);
    const accountMatch = accountPattern.exec(text);
    const typeMatch = typePattern.exec(text);

    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

    return {
      date: dateMatch ? new Date(dateMatch[1]) : new Date(),
      amount: amount,
      type: typeMatch
        ? typeMatch[1].toLowerCase() === 'credited'
          ? 'deposit'
          : 'withdrawal'
        : 'transfer',
      description: subject || 'Timo Transaction',
      status: 'pending',
      source: 'email',
      accountNumber: accountMatch ? accountMatch[1] : null,
      rawEmail: {
        subject: subject,
        from: emailData.from?.text || '',
        date: emailData.date
      }
    };
  }

  /**
   * Parse Vietcombank transaction
   */
  static parseVietcombankTransaction(emailData) {
    const text = emailData.text || '';
    const amountPattern = /(?:Số tiền|Amount)[\s:]*([0-9,]+)/i;
    const typePattern = /(Ghi nợ|Ghi có|Debit|Credit)/i;

    const amountMatch = amountPattern.exec(text);
    const typeMatch = typePattern.exec(text);

    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

    return {
      date: new Date(),
      amount: amount,
      type:
        typeMatch && typeMatch[1].toLowerCase().includes('credit')
          ? 'deposit'
          : 'withdrawal',
      description: 'Vietcombank Transaction',
      status: 'pending',
      source: 'email',
      rawEmail: {
        subject: emailData.subject || '',
        from: emailData.from?.text || '',
        date: emailData.date
      }
    };
  }

  /**
   * Parse Techcombank transaction
   */
  static parseTechcombankTransaction(emailData) {
    const text = emailData.text || '';
    const amountPattern = /(?:Số tiền|Amount)[\s:]*([0-9,]+)/i;

    const amountMatch = amountPattern.exec(text);

    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

    return {
      date: new Date(),
      amount: amount,
      type: 'transfer',
      description: 'Techcombank Transaction',
      status: 'pending',
      source: 'email',
      rawEmail: {
        subject: emailData.subject || '',
        from: emailData.from?.text || '',
        date: emailData.date
      }
    };
  }
}

module.exports = EmailNotificationService;

