import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #b4c6ff 0%, #8eaaff 100%)',
          borderRadius: 8,
          color: '#09090b',
          fontSize: 20,
          fontWeight: 900,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        H
      </div>
    ),
    {
      ...size,
    }
  );
}
