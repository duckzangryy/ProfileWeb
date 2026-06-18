# SoundCloud Integration Guide

## Overview
The music player now fetches tracks from a SoundCloud URL and displays them in a dynamic media player with album artwork, duration, and artist information.

## Current Setup
The default SoundCloud URL is:
```
https://soundcloud.com/bfmaterial-maybe
```

## How to Change the SoundCloud URL

### Option 1: Modify the Default URL (Simple)
1. Open `components/media-player.tsx`
2. Find the line: `const SOUNDCLOUD_URL = "https://soundcloud.com/bfmaterial-maybe"`
3. Replace it with your desired SoundCloud profile or playlist URL:
   ```typescript
   const SOUNDCLOUD_URL = "https://soundcloud.com/your-username"
   // or for a specific playlist:
   const SOUNDCLOUD_URL = "https://soundcloud.com/your-username/sets/your-playlist"
   ```

### Option 2: Add Environment Variable (Advanced)
1. Create a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_SOUNDCLOUD_URL=https://soundcloud.com/your-username
   ```

2. Update `components/media-player.tsx` to use the env var:
   ```typescript
   const SOUNDCLOUD_URL = process.env.NEXT_PUBLIC_SOUNDCLOUD_URL || "https://soundcloud.com/bfmaterial-maybe"
   ```

## Supported SoundCloud URLs
- **User profiles**: `https://soundcloud.com/username`
- **User playlists**: `https://soundcloud.com/username/sets/playlist-name`
- **Public playlists**: `https://soundcloud.com/username/sets/playlist-id`

## Features
✅ **Automatic Track Fetching** - Pulls tracks from your SoundCloud profile/playlist
✅ **Album Artwork Display** - Shows track cover images
✅ **Track Information** - Displays title, artist, and duration
✅ **Full Playback Controls** - Play/pause, skip, shuffle, repeat
✅ **Responsive Design** - Works on desktop and mobile
✅ **Error Handling** - Graceful fallback with user-friendly messages

## API Endpoint
The integration uses the `/api/soundcloud` endpoint which:
- Validates the SoundCloud URL
- Fetches track metadata
- Returns formatted track data to the client

### Request
```
GET /api/soundcloud?url=<soundcloud-url>
```

### Response
```json
{
  "tracks": [
    {
      "id": "1",
      "title": "Track Name",
      "artist": "Artist Name",
      "duration": 240,
      "cover": "/path/to/artwork.jpg",
      "audioUrl": "https://..."
    }
  ]
}
```

## Limitations & Notes

### Current Implementation
The current implementation uses **demo tracks** for demonstration. To use **real SoundCloud tracks**, you would need:

1. **SoundCloud API Credentials** - Requires a registered application with SoundCloud
2. **Server-side Processing** - Complex authentication flow
3. **CORS Handling** - SoundCloud doesn't provide public API access to streaming URLs

### Real SoundCloud Integration Options
1. **Official SoundCloud API** - Request access at developers.soundcloud.com
2. **Third-party Services**:
   - `scapi.proxyapi.ru` (may require credentials)
   - `pscrobbler` API (alternative SoundCloud scraper)
3. **Alternative**: Use Spotify API instead (more reliable, better documented)

### Demo vs Production
- **Demo Mode** (Current): Uses sample tracks with local audio files
- **Production Mode**: Would require setting up proper authentication and handling streaming URLs

## Troubleshooting

### Q: The playlist loads but no sound plays
**A**: This is expected with the demo tracks. Ensure audio files are in the `/public` folder:
- `/TuyetTinhCa.mp3`
- `/EmDauRoiDay.mp3`
- etc.

### Q: Error "Failed to fetch SoundCloud tracks"
**A**: The URL might be invalid or private. Verify:
- URL is public and accessible
- Format is correct (e.g., `soundcloud.com/username`)
- Profile isn't locked/private

### Q: Want to play real SoundCloud tracks?
**A**: You'll need to:
1. Set up SoundCloud API access
2. Implement OAuth authentication
3. Handle streaming URL retrieval
4. Manage rate limits

Consider using **Spotify API** as a more reliable alternative.

## Future Enhancements
- [ ] Real SoundCloud API integration with OAuth
- [ ] Spotify integration as alternative
- [ ] Search functionality for specific tracks
- [ ] Liked tracks sync
- [ ] Playlist creation/management
- [ ] User recommendations based on listening history
