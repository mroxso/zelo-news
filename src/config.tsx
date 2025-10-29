// Global app configuration
// Central place to store static keys and app-level constants

// Hex-encoded public key for platform revenue share (house account)
// Note: Keep this in hex to avoid decoding at runtime.
export const HOUSE_PUBKEY_HEX =
  '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

// Toggle showing and applying the house zap split on the article creation page
export const HOUSE_SPLIT_ENABLED = true;

export default {
  HOUSE_PUBKEY_HEX,
  HOUSE_SPLIT_ENABLED,
};
