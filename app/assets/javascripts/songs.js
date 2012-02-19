//= require slick.grid

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
			console.log(ui.value);
			user_is_seeking = false;
		}
	});

	playPause.click(function (e) {
		e.preventDefault();
		if (audio[0].paused) {
			audio[0].play();
		}
		else {
			audio[0].pause();
		}
		e.preventDefault();
	});

	shuffleButton.click(function (e) {
		e.preventDefault();
		shuffle = !shuffle;
		store.set('shuffle', shuffle);
		if (shuffle) {
			alert('shuffle is ENABLED!');
		}
		else {
			alert('shuffle is DISABLED');
		}
	});

	nextButton.click(function (e) {
		e.preventDefault();
		nextSong();
	});

	prevButton.click(function (e) {
		e.preventDefault();
		prevSong();
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
		playSong(currentSong.prev('li'));
	}

	function nextSong() {
		if (shuffle) {
			var numbah = randomToN(songs.length);
			playSong($(songs.get(numbah)));
		}
		else {
			playSong(currentSong.next('li'));
		}
	}

	function playSong(song) {
		var $this = song,
			filename = $.trim($this.text()),
			uri = $this.find('a').attr('href');

		playerTrack.text(filename);

		audio.attr('src', uri);
		audio[0].play();

		if (currentSong) currentSong.removeClass('now-playing');
		currentSong = $this;
		currentSong.addClass('now-playing');
	}

	// play songs when the name is clicked!
	songs.click(function (e) {
		e.preventDefault();
		playSong($(this));
	});

	// resize the main-area to correct height
	function resizeMain() {
		var h = $(window).height() - $('#wrap > header').innerHeight() - $('#player').innerHeight();
		var w = $(window).width() - $('#sidebar').innerWidth();
		$('#main').css('height', h);
		$('#content-wrap').css('width', w);
	}

	$(window).resize(function () {
		resizeMain();
	});
	$(window).resize();


	// SlickGrid

	var columns = [
		{ id: 'artist', name: 'Artist', field: 'artist' },
		{ id: 'tracknum', name: '#', field: 'tracknum', cssClass: 'tracknum', width: 20 },
		{ id: 'title', name: 'Title', field: 'title' },
		{ id: 'album', name: 'Album', field: 'album' },
		{ id: 'duration', name: 'Duration', field: 'nice_length', cssClass: 'duration', width: 30 },
		{ id: 'path', name: '', field: 'path' }
	];

	var options = {
		autoHeight: true,
		forceFitColumns: true,
		enableCellNavigation: true,
		enableColumnReorder: false
	};

	var grid = null;

  	$.getJSON('/songs/index', function(data) {
  		return;
    	grid = new Slick.Grid("#slickgrid", data, columns, options);

    	// double-click => play song
    	grid.onDblClick.subscribe(function (e) {
    		var cell = grid.getCellFromEvent(e);

    		playSong(data[cell.row].path);
    		e.stopPropagation();
    	});

		console.log(grid);
	});

});

//function to get random number from 1 to n
function randomToN(maxVal,floatVal)
{
   var randVal = Math.random()*maxVal;
   return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
}
