# Marketing Automation Setup Guide

This guide will help you set up the complete marketing automation features including SMS and Push notifications.

## ✅ Features Implemented

- ✅ Visual drag-and-drop workflow builder
- ✅ Multi-channel automation (Email, SMS, Push Notifications)
- ✅ All trigger-based campaigns (Welcome, Abandoned Cart, Post-Purchase, Re-engagement, Win-back)
- ✅ Conditional logic & branching
- ✅ A/B testing (split nodes)
- ✅ Time delays & scheduling
- ✅ Webhook actions
- ✅ Performance analytics per workflow

## 📦 Installation

### 1. Install Required Dependencies

```bash
cd backend
npm install twilio firebase-admin axios
```

### 2. Configure SMS Service (Twilio)

#### Sign up for Twilio:
1. Go to [Twilio](https://www.twilio.com/)
2. Create an account and verify your phone number
3. Get a Twilio phone number
4. Find your credentials in the Twilio Console

#### Add to `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Note:** Without these credentials, SMS will run in **mock mode** (logs to console only).

### 3. Configure Push Notifications (Firebase)

#### Set up Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file

#### Option A - Use Service Account File:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
```

#### Option B - Use Environment Variables:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=<base64-encoded-private-key>
```

To encode the private key:
```bash
echo -n "YOUR_PRIVATE_KEY_HERE" | base64
```

**Note:** Without Firebase credentials, push notifications will run in **mock mode**.

### 4. Update Customer Model (Optional)

To support SMS and Push notifications, add these fields to your Customer model:

```javascript
// backend/models/ecommerce/Customer.js
{
  phone: String,          // For SMS (E.164 format: +1234567890)
  fcmToken: String,       // For Push notifications
  tags: [String],         // For segmentation
}
```

## 🚀 Usage

### Creating a Workflow

1. Navigate to **Admin → Marketing Automation**
2. Click **"Create Workflow"**
3. Drag nodes from the left palette:
   - **Trigger**: Entry point (signup, order placed, cart abandoned, etc.)
   - **Action**: Send Email, SMS, Push, Webhook, Add/Remove Tag
   - **Condition**: If/else branching
   - **Delay**: Wait before next action
   - **A/B Split**: Test two paths
   - **End**: Workflow completion

4. Configure each node by clicking on it
5. Save and activate the workflow

### Example: Abandoned Cart Recovery

```
[Trigger: Cart Abandoned]
    ↓
[Delay: 1 hour]
    ↓
[Action: Send Email reminder]
    ↓
[Delay: 24 hours]
    ↓
[Condition: Cart still abandoned?]
    ├─ Yes → [Action: Send SMS with 10% discount]
    └─ No  → [End]
```

### A/B Testing Example

```
[Trigger: Customer Signup]
    ↓
[A/B Split: 50/50]
    ├─ Variant A → [Action: Send welcome email (template A)]
    └─ Variant B → [Action: Send welcome email (template B)]
```

## 📊 Analytics

Each workflow tracks:
- Total entered / completed / active
- Conversion rate
- Average completion time
- Revenue generated
- Node-level performance

Access analytics by clicking "View Analytics" on any workflow.

## 🧪 Testing

### Test SMS (Mock Mode):
If Twilio is not configured, SMS will log to console:
```
[SMS Mock Mode] Would send SMS: {
  to: '+1234567890',
  message: 'Your message here'
}
```

### Test Push Notifications (Mock Mode):
Without Firebase, push notifications log to console:
```
[Push Notification Mock Mode] Would send notification: {
  token: 'device_token...',
  title: 'Notification Title',
  body: 'Notification Body'
}
```

### Test with Real Services:
1. Add valid credentials to `.env`
2. Restart the server
3. Trigger a workflow manually via API:

```bash
POST http://localhost:3000/automation/executions/trigger
{
  "workflowId": "workflow_id_here",
  "customerId": "customer_id_here",
  "triggerType": "manual"
}
```

## 🔧 Troubleshooting

### SMS Not Sending:
- Check Twilio credentials in `.env`
- Verify phone number format (E.164: +1234567890)
- Check Twilio account balance
- Ensure phone number is verified (trial accounts)

### Push Notifications Not Sending:
- Verify Firebase credentials
- Check that customer has valid FCM token
- Ensure Firebase project has Cloud Messaging enabled
- Check Firebase Console for error logs

### Webhooks Failing:
- Verify webhook URL is accessible
- Check webhook endpoint accepts POST requests
- Review webhook timeout (10 seconds)
- Check server logs for detailed errors

## 📝 API Endpoints

### Workflows
- `GET /automation/workflows` - List all workflows
- `GET /automation/workflows/:id` - Get workflow details
- `POST /automation/workflows` - Create workflow
- `PUT /automation/workflows/:id` - Update workflow
- `DELETE /automation/workflows/:id` - Delete workflow
- `POST /automation/workflows/:id/activate` - Activate workflow
- `POST /automation/workflows/:id/pause` - Pause workflow

### Executions
- `GET /automation/executions` - List executions
- `GET /automation/executions/:id` - Get execution details
- `POST /automation/executions/trigger` - Trigger workflow manually
- `POST /automation/executions/:id/cancel` - Cancel execution

### Analytics
- `GET /automation/workflows/:id/analytics` - Get workflow analytics

## 🎯 Best Practices

1. **Start Simple**: Begin with basic email workflows before adding SMS/Push
2. **Test Mock Mode**: Test workflow logic without real API calls
3. **Monitor Analytics**: Regularly check conversion rates and optimize
4. **Set Limits**: Use "Max Executions Per Customer" to prevent spam
5. **Time Windows**: Configure appropriate send times for your audience
6. **A/B Test**: Always test different approaches to find what works best
7. **Goal Tracking**: Enable goal tracking to measure ROI

## 🔐 Security Notes

- Never commit `.env` file with real credentials
- Use environment variables in production
- Rotate API keys regularly
- Monitor usage to prevent abuse
- Set up rate limiting for webhook endpoints

## 🆘 Support

For issues or questions:
1. Check server logs: `backend/logs/`
2. Review workflow execution logs in database
3. Test services independently using test scripts
4. Check service provider status pages (Twilio, Firebase)

---

**Happy Automating! 🤖✨**
