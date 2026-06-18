function initMoviePlayer(source) {
    var video = document.getElementById('moviePlayer');
    var mask = document.getElementById('playMask');
    var ready = false;
    var hls = null;
    var bind = function () {
        if (ready || !video || !source) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    };
    var start = function () {
        bind();
        if (mask) {
            mask.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    };
    if (!video) {
        return;
    }
    if (mask) {
        mask.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', function () {
        if (mask) {
            mask.classList.add('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
