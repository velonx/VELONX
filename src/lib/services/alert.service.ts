/**
 * Alert Service
 * Sends alerts for critical errors via email or webhook
 */

import type { ErrorLogEntry } from './error-logger.service'

export type AlertChannel = 'email' | 'webhook' | 'console'

export interface AlertConfig {
  enabled: boolean
  channels: AlertChannel[]
  emailRecipients?: string[]
  webhookUrl?: string
  minSeverity: 'warning' | 'error' | 'critical'
}

export interface AlertPayload {
  severity: string
  code: string
  message: string
  timestamp: string
  requestId?: string
  userId?: string
  endpoint?: string
  method?: string
  error?: {
    name: string
    message: string
    stack?: string
  }
  context?: Record<string, any>
}

/**
 * Alert Service
 */
export class AlertService {
  private static config: AlertConfig = {
    enabled: process.env.ALERTS_ENABLED === 'true',
    channels: this.parseChannels(process.env.ALERT_CHANNELS || 'console'),
    emailRecipients: this.parseEmailRecipients(process.env.ALERT_EMAIL_RECIPIENTS),
    webhookUrl: process.env.ALERT_WEBHOOK_URL,
    minSeverity: (process.env.ALERT_MIN_SEVERITY as 'warning' | 'error' | 'critical') || 'critical',
  }

  /**
   * Send alert for error
   */
  static async sendAlert(entry: ErrorLogEntry): Promise<void> {
    // Check if alerts are enabled
    if (!this.config.enabled) {
      return
    }

    // Check if severity meets minimum threshold
    if (!this.shouldAlert(entry.severity)) {
      return
    }

    // Prepare alert payload
    const payload = this.preparePayload(entry)

    // Send to configured channels
    const promises: Promise<void>[] = []

    for (const channel of this.config.channels) {
      switch (channel) {
        case 'email':
          promises.push(this.sendEmailAlert(payload))
          break
        case 'webhook':
          promises.push(this.sendWebhookAlert(payload))
          break
        case 'console':
          promises.push(this.sendConsoleAlert(payload))
          break
      }
    }

    // Send all alerts in parallel
    await Promise.allSettled(promises)
  }

  /**
   * Check if error severity meets alert threshold
   */
  private static shouldAlert(severity: string): boolean {
    const severityLevels = {
      info: 0,
      warning: 1,
      error: 2,
      critical: 3,
    }

    const minLevel = severityLevels[this.config.minSeverity] || 3
    const currentLevel = severityLevels[severity as keyof typeof severityLevels] || 0

    return currentLevel >= minLevel
  }

  /**
   * Prepare alert payload
   */
  private static preparePayload(entry: ErrorLogEntry): AlertPayload {
    const payload: AlertPayload = {
      severity: entry.severity,
      code: entry.code,
      message: entry.message,
      timestamp: entry.timestamp.toISOString(),
      requestId: entry.requestId,
      userId: entry.userId,
      endpoint: entry.endpoint,
      method: entry.method,
      context: entry.context,
    }

    if (entry.error) {
      payload.error = {
        name: entry.error.name,
        message: entry.error.message,
        stack: process.env.NODE_ENV !== 'production' ? entry.error.stack : undefined,
      }
    }

    return payload
  }

  /**
   * Send email alert
   */
  private static async sendEmailAlert(payload: AlertPayload): Promise<void> {
    if (!this.config.emailRecipients || this.config.emailRecipients.length === 0) {
      console.warn('[Alert Service] Email recipients not configured')
      return
    }

    try {
      // In a real implementation, you would integrate with an email service
      // like SendGrid, AWS SES, or Nodemailer
      console.log('[Alert Service] Email alert would be sent to:', this.config.emailRecipients)
      console.log('[Alert Service] Email payload:', JSON.stringify(payload, null, 2))

      // Example implementation with fetch (webhook-based email service):
      // await fetch('https://api.emailservice.com/send', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
      //   },
      //   body: JSON.stringify({
      //     to: this.config.emailRecipients,
      //     subject: `[${payload.severity.toUpperCase()}] ${payload.code}`,
      //     html: this.formatEmailBody(payload),
      //   }),
      // })
    } catch (error) {
      console.error('[Alert Service] Failed to send email alert:', error)
    }
  }

  /**
   * Send webhook alert
   */
  private static async sendWebhookAlert(payload: AlertPayload): Promise<void> {
    if (!this.config.webhookUrl) {
      console.warn('[Alert Service] Webhook URL not configured')
      return
    }

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'VELONX-Alert-Service/1.0',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`)
      }

      console.log('[Alert Service] Webhook alert sent successfully')
    } catch (error) {
      console.error('[Alert Service] Failed to send webhook alert:', error)
    }
  }

  /**
   * Send console alert (for development/testing)
   */
  private static async sendConsoleAlert(payload: AlertPayload): Promise<void> {
    console.log('\n' + '='.repeat(80))
    console.log('🚨 CRITICAL ERROR ALERT 🚨')
    console.log('='.repeat(80))
    console.log(`Severity: ${payload.severity.toUpperCase()}`)
    console.log(`Code: ${payload.code}`)
    console.log(`Message: ${payload.message}`)
    console.log(`Timestamp: ${payload.timestamp}`)
    
    if (payload.requestId) {
      console.log(`Request ID: ${payload.requestId}`)
    }
    
    if (payload.userId) {
      console.log(`User ID: ${payload.userId}`)
    }
    
    if (payload.endpoint) {
      console.log(`Endpoint: ${payload.method} ${payload.endpoint}`)
    }
    
    if (payload.error) {
      console.log('\nError Details:')
      console.log(`  Name: ${payload.error.name}`)
      console.log(`  Message: ${payload.error.message}`)
      if (payload.error.stack) {
        console.log(`  Stack: ${payload.error.stack}`)
      }
    }
    
    if (payload.context && Object.keys(payload.context).length > 0) {
      console.log('\nContext:')
      console.log(JSON.stringify(payload.context, null, 2))
    }
    
    console.log('='.repeat(80) + '\n')
  }

  /**
   * Format email body (HTML)
   */
  private static formatEmailBody(payload: AlertPayload): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #495057; }
            .value { margin-top: 5px; padding: 10px; background-color: white; border-radius: 3px; }
            .error-stack { font-family: monospace; font-size: 12px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Critical Error Alert</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Severity:</div>
                <div class="value">${payload.severity.toUpperCase()}</div>
              </div>
              <div class="field">
                <div class="label">Error Code:</div>
                <div class="value">${payload.code}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${payload.message}</div>
              </div>
              <div class="field">
                <div class="label">Timestamp:</div>
                <div class="value">${payload.timestamp}</div>
              </div>
              ${payload.requestId ? `
                <div class="field">
                  <div class="label">Request ID:</div>
                  <div class="value">${payload.requestId}</div>
                </div>
              ` : ''}
              ${payload.userId ? `
                <div class="field">
                  <div class="label">User ID:</div>
                  <div class="value">${payload.userId}</div>
                </div>
              ` : ''}
              ${payload.endpoint ? `
                <div class="field">
                  <div class="label">Endpoint:</div>
                  <div class="value">${payload.method} ${payload.endpoint}</div>
                </div>
              ` : ''}
              ${payload.error ? `
                <div class="field">
                  <div class="label">Error Details:</div>
                  <div class="value">
                    <strong>Name:</strong> ${payload.error.name}<br>
                    <strong>Message:</strong> ${payload.error.message}
                    ${payload.error.stack ? `<br><br><div class="error-stack">${payload.error.stack}</div>` : ''}
                  </div>
                </div>
              ` : ''}
              ${payload.context && Object.keys(payload.context).length > 0 ? `
                <div class="field">
                  <div class="label">Context:</div>
                  <div class="value">
                    <pre>${JSON.stringify(payload.context, null, 2)}</pre>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Parse alert channels from environment variable
   */
  private static parseChannels(channelsStr: string): AlertChannel[] {
    const channels = channelsStr.split(',').map(c => c.trim()) as AlertChannel[]
    return channels.filter(c => ['email', 'webhook', 'console'].includes(c))
  }

  /**
   * Parse email recipients from environment variable
   */
  private static parseEmailRecipients(recipientsStr?: string): string[] | undefined {
    if (!recipientsStr) {
      return undefined
    }
    return recipientsStr.split(',').map(email => email.trim()).filter(email => email.length > 0)
  }

  /**
   * Update alert configuration
   */
  static updateConfig(config: Partial<AlertConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    }
  }

  /**
   * Get current configuration
   */
  static getConfig(): AlertConfig {
    return { ...this.config }
  }
}

/**
 * Helper function to send critical error alert
 */
export async function sendCriticalErrorAlert(
  code: string,
  message: string,
  error?: Error,
  context?: Record<string, any>
): Promise<void> {
  const entry = {
    severity: 'critical' as const,
    code,
    message,
    error,
    context,
    timestamp: new Date(),
  }

  await AlertService.sendAlert(entry)
}

// Export singleton instance for convenience
export const alertService = AlertService
