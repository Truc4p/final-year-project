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
    const allowSelfSigned = process.env.EMAIL_ALLOW_SELF_SIGNED === 'true' || process.env.NODE_ENV !== 'production';
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email,
        pass: config.password // Should be App Password for Gmail
      },
      tls: allowSelfSigned ? { rejectUnauthorized: false } : undefined
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

      imap.once('ready', () => {
        imap.openBox('INBOX', true, (err, box) => {
          if (err) {
            imap.end();
            return reject(err);
          }
          imap.end();
          return resolve({ success: true, message: 'IMAP connection successful' });
        });
      });

      imap.once('error', (err) => {
        reject(err);
      });

      imap.connect();
    });
  }

  /**
   * Fetch and parse bank transaction emails
   */
  static async fetchBankTransactions(config, bankName, limit = 50, options = {}) {
    try {
      const imap = this.createImapConnection(config);
      const transactions = [];

      return new Promise((resolve, reject) => {
        imap.once('ready', () => {
          imap.openBox('INBOX', true, (err, box) => {
            if (err) {
              imap.end();
              return reject(err);
            }

            // Build search criteria
            const searchCriteria = [];
            if (!(options && options.allHistory)) {
              const sinceDate = options && options.sinceDate ? new Date(options.sinceDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
              searchCriteria.push(['SINCE', sinceDate]);
            }

            // Prefer Gmail's X-GM-RAW when using Gmail to better handle diacritics and robust searching
            const useGmRaw = (config.provider === 'gmail') && (options?.from || options?.subject || options?.rawQuery);
            const gmRaw = options?.rawQuery || [
              options?.from ? `from:"${options.from}"` : null,
              options?.subject ? `subject:"${options.subject}"` : null,
              !(options && options.allHistory) && (options?.sinceDate ? `after:${new Date(options.sinceDate).toISOString().slice(0,10)}` : null)
            ].filter(Boolean).join(' ');

            // Apply targeted filters if provided (fallback for non-Gmail)
            if (!useGmRaw) {
              if (options?.from) {
                searchCriteria.push(['HEADER', 'From', options.from]);
              }
              if (options?.subject) {
                searchCriteria.push(['HEADER', 'Subject', options.subject]);
              }
            }

            const doSearch = (criteria, cb) => imap.search(criteria, cb);

            try {
              console.log('📧 IMAP search criteria', {
                useGmRaw,
                gmRaw,
                since: searchCriteria,
                provider: config.provider,
                from: options?.from,
                subject: options?.subject,
                allHistory: !!(options && options.allHistory),
                limit
              });
            } catch(_) {}

            if (useGmRaw && gmRaw) {
              doSearch([['X-GM-RAW', gmRaw], ...searchCriteria], (err, results) => {
                if (err || !results || results.length === 0) {
                  // Fallback to HEADER search if GM-RAW returns nothing
                  return doSearch(searchCriteria, (err2, results2) => handleSearchResult(err2, results2));
                }
                return handleSearchResult(null, results);
              });
            } else {
              doSearch(searchCriteria, (err, results) => handleSearchResult(err, results));
            }

            function handleSearchResult(err, results) {
              if (err) {
                imap.end();
                return reject(err);
              }

              if (!results || results.length === 0) {
                imap.end();
                return resolve([]);
              }

              const fetchIds = results.slice(0, limit);
              const f = imap.fetch(fetchIds, { bodies: '' });

              f.on('message', (msg, seqno) => {
                let buffer = '';
                msg.on('body', (stream) => {
                  stream.on('data', (chunk) => {
                    buffer += chunk.toString('utf8');
                  });
                });
                msg.once('end', async () => {
                  try {
                    const parsed = await simpleParser(buffer);
                    // Use bank-specific parser with fallback to generic
                    let txn = EmailNotificationService.parseTransactionForBank(parsed, bankName);
                    if (!txn) txn = EmailNotificationService.parseTransactionFromEmail(parsed, bankName);
                    try {
                      const preview = (parsed.text || '').slice(0, 200).replace(/\n/g, ' ');
                      console.log('📥 Parsed email', {
                        subject: parsed.subject,
                        from: parsed.from?.text,
                        date: parsed.date,
                        preview
                      });
                      if (txn) {
                        console.log('✅ Parsed transaction', {
                          amount: txn.amount,
                          type: txn.type,
                          date: txn.date,
                          description: txn.description
                        });
                      } else {
                        console.log('ℹ️ No transaction parsed from this email');
                      }
                    } catch (_) {}
                    if (txn) transactions.push(txn);
                  } catch (parseErr) {
                    console.error('Transaction parse error:', parseErr);
                  }
                });
              });

              f.once('error', (err) => {
                imap.end();
                return reject(err);
              });

              f.once('end', () => {
                imap.end();
                return resolve(transactions);
              });
            }
          });
        });

        imap.once('error', (err) => reject(err));
        imap.once('end', () => {/* connection closed */});
        imap.connect();
      });
    } catch (error) {
      throw new Error(`Failed to fetch bank transactions: ${error.message}`);
    }
  }

  /**
   * Create IMAP connection based on provider
   */
  static createImapConnection(config) {
    const allowSelfSigned = process.env.EMAIL_ALLOW_SELF_SIGNED === 'true' || process.env.NODE_ENV !== 'production';
    let imapConfig = {
      user: config.email,
      password: config.password,
      tls: true,
      tlsOptions: allowSelfSigned ? { rejectUnauthorized: false } : undefined
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
   * Extract plain text content from email (prefers text, falls back to HTML -> text)
   */
  static extractPlainText(emailData) {
    try {
      if (emailData && emailData.text && emailData.text.trim()) return emailData.text;
      let html = emailData && emailData.html ? String(emailData.html) : '';
      if (!html) return '';
      // Normalize line breaks for common tags
      html = html.replace(/<br\s*\/?>(?=.)/gi, '\n')
                 .replace(/<\/(p|div|li)>/gi, '\n');
      // Strip tags
      let text = html.replace(/<[^>]+>/g, ' ');
      // Decode minimal entities
      text = text.replace(/&nbsp;/g, ' ')
                 .replace(/&amp;/g, '&')
                 .replace(/&lt;/g, '<')
                 .replace(/&gt;/g, '>')
                 .replace(/&quot;/g, '"')
                 .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d,10)));
      // Collapse whitespace
      return text.replace(/\s+/g, ' ').trim();
    } catch (e) {
      return emailData?.text || '';
    }
  }

  /**
   * Sanitize/shorten a description, remove signatures/footers
   */
  static sanitizeDescription(desc, bankName='') {
    if (!desc) return '';
    let s = String(desc).trim();
    // Remove header labels
    s = s.replace(/^Mô tả:\s*/i, '');
    // Remove common footer/signature phrases and everything after them
    const cutters = [
      /Cảm ơn Quý khách[\s\S]*$/i,
      /Trân trọng[\s\S]*$/i,
      /Timo\s+Digital\s+Bank\s+by\s+BVBank[\s\S]*$/i,
      /Timo\s+Support[\s\S]*$/i
    ];
    for (const c of cutters) s = s.replace(c, '');
    // Collapse spaces
    s = s.replace(/\s+/g, ' ').trim();
    // If still empty, use bank name Transaction label
    if (!s) s = bankName ? `${bankName} Transaction` : 'Bank Transaction';
    // Cap length to keep UI tidy
    return s.slice(0, 160);
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
        description: EmailNotificationService.sanitizeDescription(
          (descriptionMatch && descriptionMatch[1]
            ? descriptionMatch[1].trim()
            : `${bankName} Transaction`),
          bankName
        ),
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
    const text = (EmailNotificationService.extractPlainText(emailData) || '').replace(/\r/g, '');
    const subject = emailData.subject || '';

    // Vietnamese patterns
    // Example: "Tài khoản ... vừa tăng 2.000.000 VND vào 02/12/2025 07:24. Số dư hiện tại: ...\nMô tả: ..."
    const vnChangePattern = /vừa\s+(tăng|giảm)\s+([0-9\.,]+)\s*VND/i;
    const vnDatePattern = /vào\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})/i;
    const vnDescPattern = /Mô tả:\s*(.+)/i;

    const enTypePattern = /(credited|debited|transferred)/i;
    const enAmountPattern = /(?:credited|debited|transferred)[\s]*(?:with|of)?[\s]*([0-9,\.]+)[\s]*(?:VND|đ)?/i;
    const accountPattern = /\*{4}(\d{4})/;

    let type = 'transfer';
    let amount = null;
    let date = null;
    let description = null;

    // Vietnamese detection first
    const changeMatch = vnChangePattern.exec(text);
    if (changeMatch) {
      const dir = changeMatch[1].toLowerCase();
      type = dir === 'tăng' ? 'deposit' : 'withdrawal';
      amount = Number(changeMatch[2].replace(/[\.,]/g, ''));
    }

    const dateMatch = vnDatePattern.exec(text);
    if (dateMatch) {
      // dd/MM/yyyy HH:mm local time
      const [_, d, t] = dateMatch;
      const [dd, mm, yyyy] = d.split('/').map(Number);
      const [HH, MM] = t.split(':').map(Number);
      const iso = new Date(yyyy, mm - 1, dd, HH, MM);
      if (!isNaN(iso.getTime())) date = iso;
    }

    const descMatch = vnDescPattern.exec(text);
    if (descMatch) {
      description = (descMatch[1] || '').trim();
    }

    // English fallback if Vietnamese not found
    if (amount == null) {
      const enAmt = enAmountPattern.exec(text);
      if (enAmt) amount = Number(enAmt[1].replace(/[\.,]/g, ''));
    }
    if (type === 'transfer') {
      const enType = enTypePattern.exec(text);
      if (enType) type = enType[1].toLowerCase() === 'credited' ? 'deposit' : 'withdrawal';
    }

    const accountMatch = accountPattern.exec(text);

    if (amount == null) return null;

    return {
      date: date || new Date(),
      amount: Math.abs(amount),
      type,
      description: description || subject || 'Timo Transaction',
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

