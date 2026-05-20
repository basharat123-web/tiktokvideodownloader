# YTPro - YouTube Downloader in 4K

A premium web-based downloader for YouTube videos, Shorts, and audio content with support for up to 4K resolution.

## Features

✨ **Premium Downloader**
- Support for full HD (1080p), 2K (1440p), and 4K (2160p) resolution
- YouTube Shorts detection and support
- MP3 audio extraction
- Multiple format options (MP4, WebM, MP3)
- Works with YouTube URLs and Short links

🚀 **Fast & Reliable**
- Instant video info fetching
- High-speed download servers
- Fallback to multiple download services
- No ads or limitations

## Project Structure

```
yt-video-downloader/
├── index.html              # Main UI
├── script.js               # Frontend logic
├── style.css               # Styling
├── netlify.toml            # Netlify configuration
├── package.json            # Project dependencies
├── .gitignore              # Git ignore rules
└── netlify/
    └── functions/
        └── download.js     # Netlify serverless function
```

## Local Development

### Prerequisites
- Node.js 14+ installed
- Netlify CLI (optional, for testing Netlify functions locally)

### Setup

1. **Clone or download the project**
   ```bash
   cd yt-video-downloader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start local development**
   ```bash
   # Simple: Open index.html in browser
   # OR use Netlify CLI for full function testing:
   netlify dev
   ```

4. **Test the app**
   - Paste a YouTube URL in the input field
   - Click "Fetch" to load video info
   - Select quality and format
   - Click "Download Now" to process

## How It Works

### Frontend (script.js)
1. **URL Validation**: Extracts YouTube video ID from various URL formats
2. **Metadata Fetching**: Retrieves video thumbnail and title using noembed API
3. **User Interaction**: Handles quality/format selection
4. **Download Trigger**: Initiates download with selected parameters

### Backend (netlify/functions/download.js)
1. **Request Handling**: Processes POST requests with video URL and preferences
2. **Video Info Fetching**: Uses noembed API for reliable metadata
3. **Download URL Generation**: Creates URLs for external download services
4. **CORS Support**: Enables cross-origin requests from the frontend
5. **Fallback System**: Handles failures gracefully

### Download Services
The app uses reliable third-party services:
- **Primary**: Cobalt (https://cobalt.tools/) - Recommended
- **Fallback**: SaveFrom.net, Y2mate, Loader.to

## Deployment to Netlify

### Option 1: Using Git (Recommended)
1. Create a GitHub repository
2. Push your code to GitHub
3. Connect repository to Netlify at https://app.netlify.com
4. Netlify automatically deploys on each push

### Option 2: Drag & Drop
1. Go to https://app.netlify.com/drop
2. Drag and drop the project folder
3. Netlify will deploy instantly

### Option 3: Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Configuration

### Supported Quality Options
- `max` - Best available (usually 1080p)
- `2160` - 4K Ultra HD
- `1440` - 2K (2560x1440)
- `1080` - Full HD (default)
- `720` - HD
- `480` - SD
- `360` - Low quality

### Supported Formats
- `mp4` - MP4 Video (most compatible)
- `webm` - WebM Video (better compression)
- `mp3` - MP3 Audio only

## Environment Variables (Optional)

Create a `.env` file for custom configuration:
```env
# Netlify functions timeout (seconds)
FUNCTION_TIMEOUT=30
```

## Troubleshooting

### 404 Error on Download Function
- **Local dev**: This is normal! The function is only available when deployed to Netlify
- **After deployment**: Wait 1-2 minutes for Netlify to build and deploy
- **Still failing**: Clear browser cache and refresh

### Video Not Loading
- Verify the YouTube URL is valid
- Try a different video
- Check browser console for errors (F12)
- Ensure you're not using a VPN that blocks YouTube

### Download Not Starting
- Try a different quality or format
- Disable ad blockers (they might block download URLs)
- The download will open in a new tab with the third-party service
- Follow prompts on the download service to complete

## Browser Support

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Android)

## API Details

### Serverless Function Endpoint
When deployed on Netlify, the endpoint is:
**POST** `/.netlify/functions/download`

When deployed on Vercel, the endpoint is:
**POST** `/api/download`

Request body:
```json
{
  "url": "https://youtube.com/watch?v=...",
  "videoQuality": "1080",
  "isAudioOnly": false
}
```

Response:
```json
{
  "success": true,
  "videoInfo": {
    "title": "Video Title",
    "thumbnail": "https://...",
    "type": "video|short"
  },
  "downloadUrl": "https://cobalt.tools/?url=...",
  "alternatives": ["https://...", "https://..."]
}
```

## Rate Limiting

- **Metadata API**: noembed (rate limited by their service)
- **Download Services**: Each service has its own limits
- **Recommended**: Don't abuse! Download speeds vary by server

## Legal Notice

This tool is for personal use only. Respect copyright laws in your jurisdiction. 
Always get permission before downloading copyrighted content.

## License

MIT License - See LICENSE file for details

## Support

For issues or feature requests, please check:
1. Browser console for error messages (F12)
2. This README for common problems
3. Netlify dashboard for deployment status

---

**YTPro** - Download YouTube in 4K with ease! 🚀
