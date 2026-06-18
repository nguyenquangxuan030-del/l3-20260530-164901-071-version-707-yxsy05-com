(function () {
  document.querySelectorAll('.movie-player').forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var stream = box.getAttribute('data-stream');
    var loaded = false;
    var hls = null;
    var begin = function () {
      if (!video || !stream) {
        return;
      }
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          box._hls = hls;
        } else {
          video.src = stream;
        }
        loaded = true;
      }
      box.classList.add('is-playing');
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };
    if (cover) {
      cover.addEventListener('click', begin);
    }
    if (video) {
      video.addEventListener('click', begin);
    }
  });
})();
