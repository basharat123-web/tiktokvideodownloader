const downloadBtn = document.getElementById('downloadBtn');
const tiktokUrlInput = document.getElementById('tiktokUrl');
const loader = document.getElementById('loader');
const resultArea = document.getElementById('resultArea');
const errorMsg = document.getElementById('errorMsg');

const videoThumb = document.getElementById('videoThumb');
const videoTitle = document.getElementById('videoTitle');
const hdDownload = document.getElementById('hdDownload');
const sdDownload = document.getElementById('sdDownload');
const musicDownload = document.getElementById('musicDownload');

downloadBtn.addEventListener('click', async () => {
    const url = tiktokUrlInput.value.trim();
    
    if (!url || !url.includes('tiktok.com')) {
        showError("Please enter a valid TikTok URL");
        return;
    }

    resetUI();
    showLoader(true);

    try {
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.code === 0 && result.data) {
            displayResult(result.data);
        } else {
            showError(result.msg || "Failed to fetch video. Please check the link.");
        }
    } catch (error) {
        console.error(error);
        showError("Connection error. Please try again later.");
    } finally {
        showLoader(false);
    }
});

function displayResult(data) {
    videoThumb.src = data.cover;
    videoTitle.innerText = data.title || "TikTok Video";
    
    // Helper to ensure absolute URL
    const formatUrl = (path) => {
        if (!path) return "#";
        return path.startsWith('http') ? path : `https://www.tikwm.com${path}`;
    };

    // Store URLs in data attributes
    hdDownload.dataset.url = formatUrl(data.play);
    sdDownload.dataset.url = formatUrl(data.wmplay);
    musicDownload.dataset.url = formatUrl(data.music);

    // Show result area
    resultArea.style.display = 'block';
    
    // Smooth scroll to result
    resultArea.scrollIntoView({ behavior: 'smooth' });
}

async function triggerDownload(element, fileName) {
    const url = element.dataset.url;
    if (!url || url === "#") return;

    const originalText = element.innerHTML;
    element.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Downloading...';
    element.style.pointerEvents = 'none';

    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Download failed", error);
        // Fallback: open in new tab if fetch fails due to CORS
        window.open(url, '_blank');
    } finally {
        element.innerHTML = originalText;
        element.style.pointerEvents = 'auto';
    }
}

hdDownload.addEventListener('click', (e) => {
    e.preventDefault();
    triggerDownload(hdDownload, 'tiktok_video_hd.mp4');
});

sdDownload.addEventListener('click', (e) => {
    e.preventDefault();
    triggerDownload(sdDownload, 'tiktok_video_sd.mp4');
});

musicDownload.addEventListener('click', (e) => {
    e.preventDefault();
    triggerDownload(musicDownload, 'tiktok_audio.mp3');
});

function showLoader(show) {
    loader.style.display = show ? 'block' : 'none';
    downloadBtn.disabled = show;
    downloadBtn.style.opacity = show ? '0.6' : '1';
}

function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.style.display = 'block';
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 5000);
}

function resetUI() {
    resultArea.style.display = 'none';
    errorMsg.style.display = 'none';
}

// Auto-fetch on paste
tiktokUrlInput.addEventListener('paste', () => {
    setTimeout(() => {
        if (tiktokUrlInput.value.includes('tiktok.com')) {
            downloadBtn.click();
        }
    }, 100);
});

// Allow Enter key to trigger download
tiktokUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        downloadBtn.click();
    }
});
