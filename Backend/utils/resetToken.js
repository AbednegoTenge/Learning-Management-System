import crypto from 'crypto';

export function generateResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes expiry
    return { token: hashedToken, expiresAt };
};