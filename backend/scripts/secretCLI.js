#!/usr/bin/env node

const { secretManager } = require('../services/secretInitializer');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

async function main() {
    const command = process.argv[2];
    
    try {
        await secretManager.initialize();
        
        switch (command) {
            case 'list':
                const keys = await secretManager.getSecretKeys();
                console.log('📋 Available secrets:');
                keys.forEach(key => console.log(`  - ${key}`));
                break;
                
            case 'get':
                const getKey = process.argv[3];
                if (!getKey) {
                    console.error('Usage: npm run secrets get <key>');
                    process.exit(1);
                }
                try {
                    const value = await secretManager.getSecret(getKey);
                    console.log(`${getKey}: ${value}`);
                } catch (error) {
                    console.error(`❌ Secret '${getKey}' not found`);
                }
                break;
                
            case 'set':
                const setKey = process.argv[3];
                const setValue = process.argv[4];
                
                if (!setKey) {
                    console.error('Usage: npm run secrets set <key> [value]');
                    process.exit(1);
                }
                
                let finalValue = setValue;
                if (!finalValue) {
                    finalValue = await ask(`Enter value for '${setKey}': `);
                }
                
                await secretManager.setSecret(setKey, finalValue);
                console.log(`✅ Secret '${setKey}' set successfully`);
                break;
                
            case 'delete':
                const deleteKey = process.argv[3];
                if (!deleteKey) {
                    console.error('Usage: npm run secrets delete <key>');
                    process.exit(1);
                }
                
                const confirmation = await ask(`Are you sure you want to delete '${deleteKey}'? (y/N): `);
                if (confirmation.toLowerCase() === 'y') {
                    const deleted = await secretManager.deleteSecret(deleteKey);
                    if (deleted) {
                        console.log(`✅ Secret '${deleteKey}' deleted`);
                    } else {
                        console.log(`❌ Secret '${deleteKey}' not found`);
                    }
                } else {
                    console.log('❌ Deletion cancelled');
                }
                break;
                
            case 'health':
                const health = await secretManager.healthCheck();
                console.log('🔍 Secret Manager Health:');
                console.log(`  - Initialized: ${health.initialized}`);
                console.log(`  - Secrets Count: ${health.secretsCount}`);
                console.log(`  - Encryption Key Present: ${health.encryptionKeyPresent}`);
                console.log(`  - Timestamp: ${health.timestamp}`);
                break;
                
            case 'export':
                const exportData = await secretManager.exportSecrets();
                console.log('📤 Exported secrets (encrypted):');
                console.log(exportData);
                break;
                
            case 'admin-key':
                try {
                    const adminKey = await secretManager.getSecret('ADMIN_KEY');
                    console.log('🔑 Current admin key:', adminKey);
                    console.log('ℹ️  Use this key when registering admin users');
                } catch (error) {
                    console.error('❌ Admin key not found. Run the application first to generate one.');
                }
                break;
                
            default:
                console.log('🔐 Secret Manager CLI');
                console.log('\nUsage:');
                console.log('  npm run secrets list              - List all secret keys');
                console.log('  npm run secrets get <key>         - Get secret value');
                console.log('  npm run secrets set <key> [value] - Set secret value');
                console.log('  npm run secrets delete <key>      - Delete secret');
                console.log('  npm run secrets health            - Show health status');
                console.log('  npm run secrets export            - Export secrets');
                console.log('  npm run secrets admin-key         - Show admin key');
                break;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();