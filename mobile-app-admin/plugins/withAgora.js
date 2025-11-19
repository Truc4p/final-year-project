const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

const withAgora = (config) => {
  // Add Android permissions
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Add permissions if they don't exist
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    const permissions = [
      'android.permission.INTERNET',
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.BLUETOOTH',
      'android.permission.ACCESS_WIFI_STATE',
    ];

    permissions.forEach((permission) => {
      if (
        !androidManifest['uses-permission'].find(
          (p) => p.$['android:name'] === permission
        )
      ) {
        androidManifest['uses-permission'].push({
          $: { 'android:name': permission },
        });
      }
    });

    return config;
  });

  // Add iOS permissions
  config = withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription =
      config.modResults.NSCameraUsageDescription ||
      'This app needs camera access for video streaming';
    config.modResults.NSMicrophoneUsageDescription =
      config.modResults.NSMicrophoneUsageDescription ||
      'This app needs microphone access for audio streaming';

    return config;
  });

  return config;
};

module.exports = withAgora;
