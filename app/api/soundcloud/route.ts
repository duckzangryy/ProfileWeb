import { NextRequest, NextResponse } from 'next/server';

interface ParsedTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  cover: string;
  audioUrl: string;
}

// Demo tracks - In production, you would replace this with actual SoundCloud API calls
// For now, this demonstrates how the player would work
const DEMO_TRACKS: ParsedTrack[] = [
  {
    id: '1',
    title: 'Tuyệt Tình Ca',
    artist: 'Lã Phong Lâm',
    duration: 240,
    cover: '/artworks-R45YFyvPI2wxXPkP-PUX69g-t500x500.jpg',
    audioUrl: '/TuyetTinhCa.mp3'
  },
  {
    id: '2',
    title: 'Em Đau Rồi Đấy',
    artist: 'Dương Yến Phi',
    duration: 210,
    cover: '/artworks-W3QPrHejdf5xxyUn-C5HjGw-t500x500.jpg',
    audioUrl: '/EmDauRoiDay.mp3'
  },
  {
    id: '3',
    title: 'Chân Tình',
    artist: 'Vân Trường',
    duration: 280,
    cover: '/artworks-xfUvU2QmwI7o27Gk-RQgr5A-t500x500.jpg',
    audioUrl: '/ChanTinh.mp3'
  },
  {
    id: '4',
    title: 'Ngưng Làm Bạn',
    artist: 'TINO, Hoàng Yến Chibi',
    duration: 220,
    cover: '/artworks-8JJH3iXv3xBIE9Ih-vjWrkg-t500x500.jpg',
    audioUrl: '/NgungLamBan.mp3'
  },
  {
    id: '5',
    title: 'Dấu Yêu',
    artist: 'Mỹ Tâm',
    duration: 230,
    cover: '/artworks-lH7QiVsN8ZGKs3rm-sx4opA-t500x500.jpg',
    audioUrl: '/DauYeu.mp3'
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const soundcloudUrl = searchParams.get('url');

    if (!soundcloudUrl) {
      return NextResponse.json(
        { error: 'SoundCloud URL is required' },
        { status: 400 }
      );
    }

    // For now, return demo tracks
    // In production, integrate with: https://github.com/Izumiko/pscrobbler or similar
    // Or use Spotify API if user provides that instead
    const tracks = await fetchSoundCloudTracks(soundcloudUrl);
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function fetchSoundCloudTracks(soundcloudUrl: string): Promise<ParsedTrack[]> {
  try {
    // Validate URL format
    if (!soundcloudUrl.includes('soundcloud.com')) {
      throw new Error('Invalid SoundCloud URL');
    }

    // For demonstration, return demo tracks
    // To implement real SoundCloud fetching:
    // 1. Set up SoundCloud API credentials
    // 2. Use a service like https://scapi.proxyapi.ru/ (if available)
    // 3. Or implement a browser-based scraper with proper headers
    
    console.log('[v0] Fetching from URL:', soundcloudUrl);
    
    return DEMO_TRACKS;
  } catch (error) {
    console.error('[v0] Fetch error:', error);
    throw error;
  }
}
