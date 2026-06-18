async function createHlsController(video, source) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return null;
    }

    try {
        var module = await import('./hls-vendor-dru42stk.js');
        var Hls = module.H;

        if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            return hls;
        }
    } catch (error) {
        console.warn('HLS library could not be initialized.', error);
    }

    video.src = source;
    return null;
}

function initializePlayer(shell) {
    var video = shell.querySelector('.js-hls-video');
    var button = shell.querySelector('.js-player-button');
    var status = shell.querySelector('.js-player-status');
    var source = shell.dataset.videoSrc;
    var controller = null;
    var initialized = false;

    async function play() {
        if (!video || !source) {
            if (status) {
                status.textContent = '当前播放源不可用';
            }
            return;
        }

        if (!initialized) {
            initialized = true;
            if (status) {
                status.textContent = '正在加载播放源...';
            }
            controller = await createHlsController(video, source);
        }

        if (button) {
            button.classList.add('is-hidden');
        }

        try {
            await video.play();
            if (status) {
                status.textContent = '正在播放';
            }
        } catch (error) {
            if (button) {
                button.classList.remove('is-hidden');
            }
            if (status) {
                status.textContent = '点击后即可继续播放';
            }
        }
    }

    if (button) {
        button.addEventListener('click', play);
    }

    shell.addEventListener('click', function (event) {
        if (event.target === shell) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (button) {
            button.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (!video.ended && status) {
            status.textContent = '已暂停';
        }
    });

    video.addEventListener('ended', function () {
        if (status) {
            status.textContent = '播放结束';
        }
    });

    window.addEventListener('pagehide', function () {
        if (controller && typeof controller.destroy === 'function') {
            controller.destroy();
        }
    });
}

document.querySelectorAll('.player-shell').forEach(initializePlayer);
