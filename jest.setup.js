// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Mock environment variables for testing
process.env.MEDIA_BUCKET_NAME = 'test-media-bucket'
process.env.VOICE_BUCKET_NAME = 'test-voice-bucket'
process.env.AWS_REGION = 'us-east-1'