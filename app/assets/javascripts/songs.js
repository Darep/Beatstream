(function ($) {
	$(document).ready(function () {
		var songs = $('#songlist li');
		var audio = $('#player audio');
		audio.css('display', 'none');

		var playerTrack = $('#player-song .track');
		var playPause = $('#play-pause');
		var prevButton = $('#prev');
		var nextButton = $('#next');
		var elapsed = $('#player-time .elapsed');
		var duration = $('#player-time .duration');
		var shuffleButton = $('#shuffle');

		var currentSong = null;
		var shuffle = false;

		if (store.get('shuffle')) {
			shuffle = store.get('shuffle');
		}

		// volume slider
		var volume = 0.6;
		if (store.get('volume')) {
			volume = parseFloat(store.get('volume'));
			if (volume >= 0 && volume <= 1.0) {
				audio[0].volume = volume;
			}
		}

		$('#player-volume-slider').slider({
			orientation: 'horizontal',
			value: volume * 100,
			max: 100,
			min: 0,
			range: 'min',
			slide: function (event, ui) {
				audio[0].volume = parseFloat(ui.value/100);
			},
			stop: function (event, ui) {
				store.set('volume', parseFloat(ui.value/100));
			}
		});

		// seekbar
		var seekbar = $('#seekbar-slider');
		var user_is_seeking = false;
		seekbar.slider({
			orientation: 'horizontal',
			disabled: true,
			value: 0,
			max: 100,
			min: 0,
			range: 'min',
			slide: function (event, ui) {
				console.log(ui.value);
			},
			start: function(event, ui) {
				user_is_seeking = true;
			},
			stop: function(event, ui) {
				audio[0].currentTime = ui.value;
				user_is_seeking = false;
			}
		});

		playPause.click(function (e) {
			if (audio[0].paused) {
				audio[0].play();
			}
			else {
				audio[0].pause();
			}
			e.preventDefault();
		});

		shuffleButton.click(function (e) {
			shuffle = !shuffle;
			store.set('shuffle', shuffle);
			if (shuffle) {
				alert('shuffle is ENABLED!');
			}
			else {
				alert('shuffle is DISABLED');
			}
		});

		audio.bind('play', function() {
			playPause.removeClass('paused');
			$('#player-buttons button').removeAttr('disabled');
		});

		audio.bind('pause', function() {
			playPause.addClass('paused');
		});

		audio.bind('ended', function () {
			//seekbar.slider('option', 'disabled', true);
			nextSong();
		});

		audio.bind('timeupdate', function () {
			var elaps = parseInt(audio[0].currentTime),
				mins = Math.floor(elaps/60, 10),
				secs = elaps - mins*60;

			elapsed.text((mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs));

			if (!user_is_seeking) {
				seekbar.slider('option', 'value', elaps);
			}
		});

		audio.bind('durationchange', function () {
			var dur = parseInt(audio[0].duration),
				mins = Math.floor(dur/60, 10),
				secs = dur - mins*60;

			duration.text((mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs));

			seekbar.slider('option', 'max', dur);
			seekbar.slider('option', 'disabled', false);
		});

		function prevSong() {
			currentSong.prev('li').click();
		}

		function nextSong() {
			if (shuffle) {
				var numbah = randomToN(songs.length);
				$(songs.get(numbah)).click();
			}
			else {
				currentSong.next('li').click();
			}
		}

		// play songs when the name is clicked!
		songs.click(function (e) {
			e.preventDefault();

			var $this = $(this),
				filename = $.trim($this.text()),
				uri = $this.find('a').attr('href');

			playerTrack.text(filename);

			audio.attr('src', uri);
			audio[0].play();

			if (currentSong) currentSong.removeClass('now-playing');
			currentSong = $this;
			currentSong.addClass('now-playing');
		});

	});

	// resize the main-area to correct height
	$(document).ready(function () {
		function resizeMain() {
			var h = $(window).height() - $('#wrap > header').innerHeight() - $('#player').innerHeight();
			$('#main').css('height', h);
		}

		resizeMain();

		$(window).resize(function () {
			resizeMain();
		});
	});

})(jQuery);

//function to get random number from 1 to n
function randomToN(maxVal,floatVal)
{
   var randVal = Math.random()*maxVal;
   return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
}
