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
            const id = getYouTubeId(url);
            if (id) {
                thumbnail.src = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
                videoTitle.textContent = "Video loaded";
                resultArea.classList.remove('hidden');
            }

            setStatus('Ready to download!', 'success');
            resultArea.classList.remove('hidden');
            resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
            console.error(err);
            setStatus('Ready! Click Download to process.', 'success');
        } finally {
            loader.classList.add('hidden');
        }
    };

    const triggerDownload = async () => {
        const url = videoUrlInput.value.trim();
        const quality = qualitySelect.value;
        const format = formatSelect.value;

        loader.classList.remove('hidden');
        setStatus('Processing...', 'success');

        try {
            let data = null;

            // Try Netlify Function (works when deployed)
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
                    data = await response.json();
                }
            } catch (e) {
                console.log("Local/not deployed - Netlify function unavailable");
            }

            if (data && data.url) {
                // Open download service in new window instead of trying direct download
                window.open(data.url, '_blank');
                setStatus('Download service opened in new tab!', 'success');
            } else {
                setStatus('Try again. Opening Cobalt downloader...', 'error');
                const url = videoUrlInput.value.trim();
                window.open(`https://cobalt.tools/?url=${encodeURIComponent(url)}`, '_blank');
            }

        } catch (err) {
            console.error(err);
            setStatus('Deploy to Netlify to enable downloads', 'error');
        } finally {
            loader.classList.add('hidden');
        }
    };

    searchBtn.addEventListener('click', fetchInfo);
    downloadBtn.addEventListener('click', triggerDownload);
    videoUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchInfo(); });
});
