document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const searchBtn = document.getElementById('searchBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultArea = document.getElementById('resultArea');
    const statusMessage = document.getElementById('statusMessage');
    const loader = document.getElementById('loader');

    const thumbnail = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const typeBadge = document.getElementById('typeBadge');
    const qualitySelect = document.getElementById('quality');
    const formatSelect = document.getElementById('format');

    let currentVideoData = null;

    const setStatus = (msg, type = '') => {
        statusMessage.textContent = msg;
        statusMessage.className = `status-message ${type}`;
    };

    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const isShorts = (url) => url.includes('/shorts/');

    const fetchInfo = async () => {
        const url = videoUrlInput.value.trim();
        if (!url) {
            setStatus('Please paste a valid YouTube link', 'error');
            return;
        }

        setStatus('');
        loader.classList.remove('hidden');
        resultArea.classList.add('hidden');

        try {
            // Try to fetch from Netlify function first (if deployed)
            try {
                const response = await fetch('/.netlify/functions/download', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.videoInfo) {
                        thumbnail.src = data.videoInfo.thumbnail || `https://img.youtube.com/vi/${getYouTubeId(url)}/maxresdefault.jpg`;
                        videoTitle.textContent = data.videoInfo.title || "Video loaded";
                        typeBadge.textContent = (data.videoInfo.type === 'short' ? 'Short' : 'Video');
                        currentVideoData = data;
                    }
                }
            } catch (e) {
                // Local development: Use basic info
                console.log("Using local metadata fallback");
                const id = getYouTubeId(url);
                if (id) {
                    thumbnail.src = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
                    videoTitle.textContent = "Video loaded";
                    typeBadge.textContent = isShorts(url) ? 'Short' : 'Video';
                }
            }

            setStatus('Ready to download!', 'success');
            resultArea.classList.remove('hidden');
            resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
            console.error(err);
            setStatus('Please try a different link', 'error');
        } finally {
            loader.classList.add('hidden');
        }
    };

    const triggerDownload = async () => {
        const url = videoUrlInput.value.trim();
        const quality = qualitySelect.value;
        const format = formatSelect.value;

        loader.classList.remove('hidden');
        setStatus('Preparing download...', 'success');

        try {
            let downloadUrl = null;

            // Try Netlify Function first (works when deployed)
            try {
                const response = await fetch('/.netlify/functions/download', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: url,
                        videoQuality: quality === 'max' ? '1080' : quality,
                        isAudioOnly: format === 'mp3'
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    downloadUrl = data.downloadUrl || data.url;
                }
            } catch (e) {
                console.log("Netlify function unavailable, using fallback");
            }

            // Fallback or if no URL from function
            if (!downloadUrl) {
                const qualityParam = quality === 'max' ? '1080' : quality;
                downloadUrl = `https://cobalt.tools/?url=${encodeURIComponent(url)}&vQuality=${qualityParam}${format === 'mp3' ? '&aFormat=mp3' : ''}`;
            }

            // Open download service in new tab
            window.open(downloadUrl, '_blank');
            setStatus('✓ Download service opened in new tab!', 'success');

        } catch (err) {
            console.error(err);
            setStatus('Error: ' + err.message, 'error');
        } finally {
            loader.classList.add('hidden');
        }
    };

    searchBtn.addEventListener('click', fetchInfo);
    downloadBtn.addEventListener('click', triggerDownload);
    videoUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchInfo(); });
});
