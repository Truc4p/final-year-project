// Test Marketing Automation API
// Run with: node testWorkflowAPI.js

const axios = require('axios');

const API_URL = 'http://localhost:3000';

// You'll need to get a valid token by logging in first
const TOKEN = 'your-admin-token-here';

async function testWorkflowCreation() {
  try {
    console.log('🧪 Testing Workflow Creation with New Features...\n');

    // Create a workflow with SMS, Push, and Split nodes
    const workflow = {
      name: 'Test Multi-Channel Campaign',
      description: 'Testing SMS, Push, and A/B Split',
      category: 'custom',
      entryNode: 'trigger_1',
      nodes: [
        {
          id: 'trigger_1',
          type: 'trigger',
          triggerType: 'manual',
          position: { x: 100, y: 100 },
          nextNodes: [{ nodeId: 'split_1' }]
        },
        {
          id: 'split_1',
          type: 'split',
          splitPercentage: 50,
          position: { x: 100, y: 200 },
          nextNodes: [
            { nodeId: 'sms_1', condition: 'variantA' },
            { nodeId: 'push_1', condition: 'variantB' }
          ]
        },
        {
          id: 'sms_1',
          type: 'action',
          actionType: 'send_sms',
          actionConfig: {
            smsTemplate: 'Hello {{name}}, you got Variant A! 🎉'
          },
          position: { x: 50, y: 300 },
          nextNodes: [{ nodeId: 'webhook_1' }]
        },
        {
          id: 'push_1',
          type: 'action',
          actionType: 'send_push',
          actionConfig: {
            pushTemplate: {
              title: 'You got Variant B!',
              body: 'Hello {{name}}, testing push notifications 🔔'
            }
          },
          position: { x: 150, y: 300 },
          nextNodes: [{ nodeId: 'webhook_1' }]
        },
        {
          id: 'webhook_1',
          type: 'action',
          actionType: 'webhook',
          actionConfig: {
            webhookUrl: 'https://webhook.site/unique-url-here'
          },
          position: { x: 100, y: 400 },
          nextNodes: [{ nodeId: 'end_1' }]
        },
        {
          id: 'end_1',
          type: 'end',
          position: { x: 100, y: 500 },
          nextNodes: []
        }
      ],
      settings: {
        allowReEntry: false,
        maxExecutionsPerCustomer: 10
      }
    };

    const response = await axios.post(
      `${API_URL}/automation/workflows`,
      workflow,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Workflow created successfully!');
    console.log('Workflow ID:', response.data.data._id);
    console.log('\nWorkflow includes:');
    console.log('  - A/B Split node (50/50)');
    console.log('  - SMS action (Variant A)');
    console.log('  - Push notification (Variant B)');
    console.log('  - Webhook action');
    console.log('\nNext: Activate and trigger the workflow to see it in action!');

    return response.data.data._id;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('\n💡 Tip: Make sure to replace TOKEN with a valid admin token');
  }
}

// Run the test
testWorkflowCreation();
