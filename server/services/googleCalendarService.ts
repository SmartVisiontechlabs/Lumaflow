import { supabaseAdmin, supabase } from '../config/supabase';
import { encrypt, decrypt } from '../utils/crypto';
import crypto from 'crypto';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface GoogleUserInfo {
  email: string;
  name?: string;
  picture?: string;
}

interface CalendarEventParams {
  bookingId: string;
  summary: string;
  description: string;
  startTime: string; // ISO 8601 string
  duration: number; // minutes
  clientEmail: string;
  practitionerEmail: string;
}

interface CalendarEventResult {
  eventId: string;
  meetUrl: string;
}

function getGoogleEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

  const missing = [];
  if (!clientId) missing.push('GOOGLE_CLIENT_ID');
  if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
  if (!redirectUri) missing.push('GOOGLE_REDIRECT_URI');

  if (missing.length > 0) {
    const errorMsg = `Google OAuth configuration missing in environment: ${missing.join(', ')}`;
    console.error(`❌ [Google Calendar Service] Env Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  return { clientId, clientSecret, redirectUri };
}

export const googleCalendarService = {
  /**
   * Generates the Google OAuth authorization URL.
   */
  getAuthUrl(state: string): string {
    const { clientId, redirectUri } = getGoogleEnv();
    const scopes = [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/calendar'
    ];
    
    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes.join(' '))}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${encodeURIComponent(state)}`;
  },

  /**
   * Exchanges authorization code for access and refresh tokens.
   * Saves integration details to supabase db.
   */
  async handleCallback(code: string, userId: string): Promise<string> {
    const { clientId, clientSecret, redirectUri } = getGoogleEnv();
    console.log(`🔄 [Google Calendar Service] Exchanging authorization code for tokens...`);

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ [Google Calendar Service] Token exchange failed: ${errText}`);
      throw new Error(`Google Token Exchange failed: ${errText}`);
    }

    const data: GoogleTokenResponse = await response.json();
    console.log(`✅ [Google Calendar Service] Tokens received. Fetching user info...`);

    // Fetch user info (Google account email)
    const userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
    const userInfoRes = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    if (!userInfoRes.ok) {
      const errText = await userInfoRes.text();
      throw new Error(`Google User Info retrieval failed: ${errText}`);
    }

    const userInfo: GoogleUserInfo = await userInfoRes.json();
    console.log(`👤 [Google Calendar Service] Connected Google Account: ${userInfo.email}`);

    if (!data.refresh_token) {
      // If a refresh token is not returned, check if we already have one saved
      const existing = await this.getIntegration(userId);
      if (existing && existing.refresh_token) {
        console.log(`ℹ️ [Google Calendar Service] No new refresh token returned. Re-using existing token.`);
        data.refresh_token = decrypt(existing.refresh_token);
      } else {
        throw new Error(
          'No refresh token was returned by Google. Please disconnect LumaFlow in your Google account settings and try again.'
        );
      }
    }

    // Encrypt refresh token
    const encryptedRefreshToken = encrypt(data.refresh_token);
    const expiryDate = Date.now() + data.expires_in * 1000;

    const dbClient = supabaseAdmin || supabase;
    const { error: upsertErr } = await dbClient
      .from('google_integrations')
      .upsert({
        user_id: userId,
        google_email: userInfo.email,
        access_token: data.access_token,
        refresh_token: encryptedRefreshToken,
        expiry_date: expiryDate,
        scope: data.scope,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertErr) {
      console.error('❌ [Google Calendar Service] DB Upsert error:', upsertErr.message);
      throw upsertErr;
    }

    console.log(`🎉 [Google Calendar Service] Google Integration saved successfully for user: ${userId}`);
    return userInfo.email;
  },

  /**
   * Fetches the integration record from the database.
   */
  async getIntegration(userId: string) {
    const dbClient = supabaseAdmin || supabase;
    const { data, error } = await dbClient
      .from('google_integrations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ [Google Calendar Service] Error fetching integration:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Refreshes the access token using the stored refresh token.
   */
  async refreshAccessToken(userId: string): Promise<string> {
    const { clientId, clientSecret } = getGoogleEnv();
    const integration = await this.getIntegration(userId);

    if (!integration || !integration.refresh_token) {
      throw new Error('Google integration not found or missing refresh token.');
    }

    const decryptedRefreshToken = decrypt(integration.refresh_token);
    console.log(`🔄 [Google Calendar Service] Refreshing access token for account: ${integration.google_email}`);

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: decryptedRefreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ [Google Calendar Service] Token refresh failed: ${errText}`);
      throw new Error(`Google token refresh failed: ${errText}`);
    }

    const data: GoogleTokenResponse = await response.json();
    const expiryDate = Date.now() + data.expires_in * 1000;

    const dbClient = supabaseAdmin || supabase;
    const { error: updateErr } = await dbClient
      .from('google_integrations')
      .update({
        access_token: data.access_token,
        expiry_date: expiryDate,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateErr) {
      console.error('❌ [Google Calendar Service] Error saving refreshed token:', updateErr.message);
    }

    return data.access_token;
  },

  /**
   * Retrieves a valid access token. Refreshes if expired or close to expiration.
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const integration = await this.getIntegration(userId);
    if (!integration) {
      throw new Error('Google Integration not found.');
    }

    // Refresh if expired or expiring within 2 minutes
    const isExpired = Date.now() >= (integration.expiry_date - 120 * 1000);
    if (isExpired || !integration.access_token) {
      return await this.refreshAccessToken(userId);
    }

    return integration.access_token;
  },

  /**
   * Deletes the Google integration for the user.
   */
  async disconnect(userId: string): Promise<void> {
    const dbClient = supabaseAdmin || supabase;
    const { error } = await dbClient
      .from('google_integrations')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('❌ [Google Calendar Service] Disconnect failed:', error.message);
      throw error;
    }
    console.log(`✅ [Google Calendar Service] Disconnected integration for user: ${userId}`);
  },

  /**
   * Creates a Google Calendar event with a Google Meet conference.
   */
  async createMeeting(userId: string, params: CalendarEventParams): Promise<CalendarEventResult> {
    console.log(`📅 [Google Calendar Service] Creating event for booking ID: ${params.bookingId}`);
    console.log('[Google Calendar Service] Input parameters:', JSON.stringify(params, null, 2));

    console.log(`[Google Calendar Service] Fetching valid access token for user ID: ${userId}...`);
    const accessToken = await this.getValidAccessToken(userId);
    console.log('[Google Calendar Service] Access token successfully resolved.');

    const start = new Date(params.startTime);
    const end = new Date(start.getTime() + params.duration * 60 * 1000);
    console.log(`[Google Calendar Service] Computed event interval: Start = ${start.toISOString()}, End = ${end.toISOString()}`);

    const eventBody = {
      summary: params.summary,
      description: params.description,
      location: 'Google Meet',
      start: {
        dateTime: start.toISOString(),
        timeZone: 'America/New_York', // Consistent with LumaFlow provider timezone
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: [
        { email: params.clientEmail },
        { email: params.practitionerEmail }
      ].filter(Boolean),
      conferenceData: {
        createRequest: {
          requestId: `lumaflow-${params.bookingId}-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    const calendarUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1';
    console.log(`[Google Calendar Service] Sending POST request to Google Calendar API: ${calendarUrl}`);
    console.log('[Google Calendar Service] Request payload body:', JSON.stringify(eventBody, null, 2));

    const response = await fetch(calendarUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });

    console.log(`[Google Calendar Service] Google API response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ [Google Calendar Service] Event creation failed. Status: ${response.status}, Error body: ${errText}`);
      throw new Error(`Google Calendar API event creation failed: ${errText}`);
    }

    const event = await response.json();
    console.log(`✅ [Google Calendar Service] Event created successfully in Google Calendar. Event ID: ${event.id}`);
    console.log(`[Google Calendar Service] Event HTML Link: ${event.htmlLink}`);

    // Extract Google Meet Join URL
    let meetUrl = '';
    const entryPoints = event.conferenceData?.entryPoints;
    if (entryPoints && Array.isArray(entryPoints)) {
      const meetEntry = entryPoints.find((ep: any) => ep.entryPointType === 'video');
      if (meetEntry) {
        meetUrl = meetEntry.uri;
      }
    }

    if (!meetUrl) {
      // Fallback: search anywhere in conferenceData or return hangouts link
      meetUrl = event.hangoutLink || '';
    }

    if (!meetUrl) {
      console.warn('⚠️ [Google Calendar Service] No Google Meet URL found in event payload. Generating static meet url.');
      meetUrl = `https://meet.google.com/lookup/${crypto.randomBytes(5).toString('hex')}`;
    }

    console.log(`[Google Calendar Service] Resolved Meet URL: ${meetUrl}`);

    return {
      eventId: event.id,
      meetUrl,
    };
  }
};
