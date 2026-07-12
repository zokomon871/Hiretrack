import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'HireTrack - Applicant tracking made simple';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #09090b, #171720)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: 64,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: '48px 64px',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)',
          }}
        >
          <h1
            style={{
              fontSize: 84,
              fontWeight: 800,
              letterSpacing: '-0.05em',
              margin: 0,
              background: 'linear-gradient(to bottom right, #ffffff, #a1a1aa)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            HireTrack
          </h1>
          <p
            style={{
              fontSize: 32,
              color: '#a1a1aa',
              marginTop: 24,
              textAlign: 'center',
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            The applicant pipeline built for modern recruiting teams.
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
