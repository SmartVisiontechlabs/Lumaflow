import crypto from 'crypto';

// Salt for key derivation if GOOGLE_ENCRYPTION_KEY is missing
const DERIVATION_SALT = 'lumaflow-google-salt-2026';
const ALGORITHM = 'aes-256-gcm';

/**
 * Retrieves or derives a 32-byte key for AES-256-GCM.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.GOOGLE_ENCRYPTION_KEY;
  if (envKey) {
    // If the key is provided directly in hex/base64 or string, try to match size
    if (envKey.length === 64) {
      return Buffer.from(envKey, 'hex');
    }
    // Fallback: derive a 32-byte key from the provided string using scrypt
    return crypto.scryptSync(envKey, DERIVATION_SALT, 32);
  }

  // Fallback: derive from SUPABASE_SERVICE_ROLE_KEY or other env variables to prevent crash
  const secretSource = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.GOOGLE_CLIENT_SECRET || 
    'fallback-insecure-key-source-lumaflow';
  
  if (secretSource === 'fallback-insecure-key-source-lumaflow') {
    console.warn(
      '⚠️ [Crypto Utils] Warning: No secure key source found. Refresh tokens will be encrypted using fallback key.'
    );
  }

  return crypto.scryptSync(secretSource, DERIVATION_SALT, 32);
}

/**
 * Encrypts a text string using AES-256-GCM.
 * Returns a string in the format "iv:authTag:encryptedData" (hex encoded).
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12); // GCM standard IV size is 12 bytes
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error: any) {
    console.error('❌ [Crypto Utils] Encryption failed:', error);
    throw new Error(`Token encryption failed: ${error.message}`);
  }
}

/**
 * Decrypts a hex string in the format "iv:authTag:encryptedData" using AES-256-GCM.
 * Returns the decrypted plaintext string.
 */
export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format (expected iv:authTag:encryptedData)');
    }

    const [ivHex, authTagHex, encryptedDataHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encryptedData = Buffer.from(encryptedDataHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error: any) {
    console.error('❌ [Crypto Utils] Decryption failed:', error);
    throw new Error(`Token decryption failed: ${error.message}`);
  }
}

/**
 * Generates a signed OAuth state parameter to prevent CSRF and securely pass context.
 */
export function generateOAuthState(userId: string): string {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = `${userId}:${timestamp}:${nonce}`;
  
  const secret = process.env.GOOGLE_CLIENT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-csrf-secret';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  // Format is payload.signature
  const state = `${Buffer.from(payload).toString('base64')}.${signature}`;
  return state;
}

/**
 * Verifies the signed OAuth state parameter.
 * Returns the userId if valid, or throws an error.
 */
export function verifyOAuthState(state: string): string {
  try {
    const parts = state.split('.');
    if (parts.length !== 2) {
      throw new Error('Malformed state parameter');
    }

    const [payloadB64, signature] = parts;
    const payload = Buffer.from(payloadB64, 'base64').toString('utf8');
    
    // Verify signature
    const secret = process.env.GOOGLE_CLIENT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-csrf-secret';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      throw new Error('State signature mismatch (potential CSRF/tampering)');
    }

    // Extract parts
    const [userId, timestampStr] = payload.split(':');
    const timestamp = parseInt(timestampStr, 10);
    
    // Check expiration (state valid for 15 minutes)
    const age = Date.now() - timestamp;
    if (age < 0 || age > 15 * 60 * 1000) {
      throw new Error('OAuth state has expired');
    }

    return userId;
  } catch (error: any) {
    console.error('❌ [Crypto Utils] OAuth State verification failed:', error.message);
    throw new Error(`CSRF validation failed: ${error.message}`);
  }
}

