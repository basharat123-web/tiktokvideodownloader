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

    const isFileProtocol = window.location.protocol === 'file:';
    const functionPaths = isFileProtocol ? [] : ['/.netlify/functions/download', '/api/download'];

    const callServerFunction = async (payload) => {
        for (const path of functionPaths) {
            try {
                const response = await fetch(path, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    return await response.json();
                }
            } catch (err) {
                console.warn(`Server function unavailable at ${path}`, err.message);
            }
        }
        return null;
    };

    const fetchMetadataFallback = async (videoUrl) => {
        try {
            const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`);
            if (!response.ok) throw new Error('Metadata service unavailable');
            const info = await response.json();
            return {
                title: info.title || 'Video loaded',
                thumbnail: info.thumbnail_url || `https://img.youtube.com/vi/${getYouTubeId(videoUrl)}/maxresdefault.jpg`,
                type: videoUrl.includes('/shorts/') ? 'short' : 'video'
            };
        } catch (error) {
            const id = getYouTubeId(videoUrl);
            return {
                title: 'Video loaded',
                thumbnail: id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '',
                type: isShorts(videoUrl) ? 'short' : 'video'
            };
        }
    };

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
            let videoInfo = null;
            if (!isFileProtocol) {
                const data = await callServerFunction({ url });
                if (data && data.videoInfo) {
                    videoInfo = data.videoInfo;
                }
            }

            if (!videoInfo) {
                videoInfo = await fetchMetadataFallback(url);
            }

            thumbnail.src = videoInfo.thumbnail;
            videoTitle.textContent = videoInfo.title;
            typeBadge.textContent = videoInfo.type === 'short' ? 'Short' : 'Video';
            currentVideoData = videoInfo;

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
        setStatus('⏳ Preparing your download...', 'success');

        try {
            let downloadUrl = null;

            if (!isFileProtocol) {
                const data = await callServerFunction({
                    url,
                    videoQuality: quality === 'max' ? '1080' : quality,
                    isAudioOnly: format === 'mp3'
                });
                if (data) {
                    downloadUrl = data.downloadUrl || data.url;
                }
            }

            if (!downloadUrl) {
                const qualityParam = quality === 'max' ? '1080' : quality;
                downloadUrl = `https://cobalt.tools/?url=${encodeURIComponent(url)}&vQuality=${qualityParam}${format === 'mp3' ? '&aFormat=mp3' : ''}`;
            }

            window.open(downloadUrl, '_blank');
            setStatus('✓ Download started! Check your browser for pop-ups.', 'success');
        } catch (err) {
            console.error(err);
            setStatus('❌ Error: ' + (err.message || 'Failed to start download'), 'error');
        } finally {
            loader.classList.add('hidden');
        }
    };

    searchBtn.addEventListener('click', fetchInfo);
    downloadBtn.addEventListener('click', triggerDownload);
    videoUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchInfo(); });
});
