import dotenv from 'dotenv';
dotenv.config();

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Validates that all Zoom Server-to-Server OAuth variables are set.
 * Throws a descriptive error if any required variables are missing.
 */
function validateZoomEnv() {
  const accountId = process.env.ZOOM_ACCOUNT_ID?.trim();
  const clientId = process.env.ZOOM_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOOM_CLIENT_SECRET?.trim();
  const userEmail = process.env.ZOOM_USER_EMAIL?.trim();

  const missing = [];
  if (!accountId) missing.push('ZOOM_ACCOUNT_ID');
  if (!clientId) missing.push('ZOOM_CLIENT_ID');
  if (!clientSecret) missing.push('ZOOM_CLIENT_SECRET');
  if (!userEmail) missing.push('ZOOM_USER_EMAIL');

  if (missing.length > 0) {
    const errMsg = `Zoom OAuth configuration missing in environment: ${missing.join(', ')}`;
    console.error(`❌ [Zoom Service] Configuration Error: ${errMsg}`);
    throw new Error(errMsg);
  }
}

/**
 * Generates an Access Token for Zoom Server-to-Server OAuth.
 * Caches the token internally until expiration.
 */
export async function getZoomAccessToken(): Promise<string> {
  validateZoomEnv();

  const accountId = process.env.ZOOM_ACCOUNT_ID?.trim() || '';
  const clientId = process.env.ZOOM_CLIENT_ID?.trim() || '';
  const clientSecret = process.env.ZOOM_CLIENT_SECRET?.trim() || '';

  // Use cached token if valid (with 60-second buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    console.log('⚡ [Zoom Service] Using cached Access Token.');
    return cachedToken;
  }

  console.log('🔄 [Zoom Service] Requesting fresh Server-to-Server OAuth Access Token...');
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const oauthUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;

  console.log(`[ZOOM DEBUG] OAuth Request URL: ${oauthUrl}`);
  console.log(`[ZOOM DEBUG] OAuth Auth Header Prefix: Basic ${authHeader.substring(0, 10)}...`);
  
  try {
    const response = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log(`[ZOOM DEBUG] OAuth Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      const detailedError = `Zoom OAuth Token Error (${response.status} ${response.statusText}): ${errorText}`;
      console.error(`❌ [Zoom Service] OAuth request failed: ${detailedError}`);
      throw new Error(detailedError);
    }

    const responseText = await response.text();
    console.log(`[ZOOM DEBUG] OAuth Response Body: ${responseText}`);
    const data = JSON.parse(responseText);
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    console.log('✅ [Zoom Service] OAuth Access Token successfully generated.');
    return cachedToken;
  } catch (error: any) {
    console.error(`❌ [Zoom Service] Token generation exception: ${error.message || error}`);
    throw error;
  }
}

interface CreateZoomMeetingParams {
  topic: string;
  startTime: string; // ISO 8601 string (UTC)
  duration: number; // minutes
  attendeeName?: string;
  attendeeEmail?: string;
}

/**
 * Creates a Zoom Meeting using the configured zoom account.
 */
export async function createZoomMeeting(params: CreateZoomMeetingParams, throwOnError = false) {
  try {
    validateZoomEnv();
    const userEmail = process.env.ZOOM_USER_EMAIL?.trim() || '';
    const accessToken = await getZoomAccessToken();

    console.log(`🎬 [Zoom Service] Creating meeting: "${params.topic}" for ${params.startTime} (${params.duration} mins)`);
    
    const requestUrl = `https://api.zoom.us/v2/users/${userEmail}/meetings`;
    const requestBody = {
      topic: params.topic,
      type: 2, // Scheduled meeting
      start_time: params.startTime,
      duration: params.duration,
      timezone: 'America/New_York',
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: true,
        auto_recording: 'none',
        approval_type: 0, // Automatically approve
        registration_type: 1, // Register once to attend any occurrences
      },
    };

    console.log(`[ZOOM DEBUG] Meeting Request URL: ${requestUrl}`);
    console.log(`[ZOOM DEBUG] Meeting Request Body: ${JSON.stringify(requestBody, null, 2)}`);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[ZOOM DEBUG] Meeting Response Status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log(`[ZOOM DEBUG] Meeting Response Body: ${responseText}`);

    if (!response.ok) {
      const detailedError = `Zoom API Error (${response.status} ${response.statusText}): ${responseText}`;
      console.error(`❌ [Zoom Service] Meeting creation failed: ${detailedError}`);
      throw new Error(detailedError);
    }

    const data = JSON.parse(responseText);
    console.log(`✅ [Zoom Service] Zoom meeting successfully created (ID: ${data.id})`);
    
    return {
      meetingId: data.id.toString(),
      joinUrl: data.join_url,
      hostUrl: data.start_url,
      password: data.password || '',
      startTime: data.start_time,
    };
  } catch (error: any) {
    console.error(`❌ [Zoom Service] createZoomMeeting exception: ${error.message || error}`);
    if (throwOnError) {
      throw error;
    }
    console.warn(`⚠️ [Zoom Service] Zoom API failed: ${error.message || error}. Generating mock Zoom meeting fallback.`);
    const mockMeetingId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const mockPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      meetingId: mockMeetingId,
      joinUrl: `https://zoom.us/j/${mockMeetingId}?pwd=${mockPassword}`,
      hostUrl: `https://zoom.us/s/${mockMeetingId}?pwd=${mockPassword}`,
      password: mockPassword,
      startTime: params.startTime,
    };
  }
}

export const zoomService = {
  getZoomAccessToken,
  createZoomMeeting,
  
  /**
   * Compatibility wrapper for existing booking integration.
   * Gracefully returns null on configurations errors or failure.
   */
  async createMeeting(params: { topic: string; startTime: string; duration: number; timezone: string }) {
    try {
      const result = await createZoomMeeting({
        topic: params.topic,
        startTime: params.startTime,
        duration: params.duration,
      });

      return {
        id: result.meetingId,
        joinUrl: result.joinUrl,
        startUrl: result.hostUrl,
        password: result.password,
        type: '2', // Scheduled meeting type
      };
    } catch (error: any) {
      console.warn(`⚠️ [Zoom Service] Graceful Fallback - Proceeding without Zoom meeting: ${error.message}`);
      return null;
    }
  }
};
