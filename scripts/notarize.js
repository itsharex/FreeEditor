require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  // Support both API Key and Apple ID authentication methods
  const appleApiKey = process.env.APPLE_API_KEY;
  const appleApiKeyId = process.env.APPLE_API_KEY_ID;
  const appleApiIssuer = process.env.APPLE_API_ISSUER;
  const teamId = process.env.APPLE_TEAM_ID;

  // Fallback to Apple ID method
  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_ID_PASSWORD;

  console.log('Environment check:', {
    hasAppleId: !!appleId,
    hasPassword: !!appleIdPassword,
    hasTeamId: !!teamId,
    hasApiKey: !!appleApiKey,
  });

  // Check for API Key method (recommended)
  if (appleApiKey && appleApiKeyId && appleApiIssuer) {
    console.log(`Notarizing ${appPath} using API Key...`);
    try {
      await notarize({
        appPath,
        appleApiKey,
        appleApiKeyId,
        appleApiIssuer,
      });
      console.log('Notarization successful!');
      return;
    } catch (error) {
      console.error('Notarization failed:', error);
      throw error;
    }
  }

  // Check for Apple ID method
  if (appleId && appleIdPassword && teamId) {
    console.log(`Notarizing ${appPath} using Apple ID...`);
    try {
      await notarize({
        appPath,
        appleId,
        appleIdPassword,
        teamId,
      });
      console.log('Notarization successful!');
      return;
    } catch (error) {
      console.error('Notarization failed:', error);
      throw error;
    }
  }

  console.warn('Skipping notarization: Required environment variables not set');
  console.warn('For API Key method (recommended), set: APPLE_API_KEY, APPLE_API_KEY_ID, APPLE_API_ISSUER');
  console.warn('For Apple ID method, set: APPLE_ID, APPLE_ID_PASSWORD, APPLE_TEAM_ID');
};
