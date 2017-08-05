var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-IN';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

var currentSongNumber = 1;
var willLoop = 0;
var willShuffle = 0;

var songs = [
  {
    'name': 'Tamma Tamma Again',
    'artist': 'Neha Kakkar, Monali Thakur, Ikka Singh, Dev Negi',
    'album': 'Badrinath ki Dulhania',
    'duration': '2:56',
    'fileName': 'song1.mp3',
    'image' : 'badri.jpg'
  },
  {
    'name': 'Humma Song',
    'artist': 'Badshah, Jubin Nautiyal, Shashaa Tirupati',
    'album': 'Ok Jaanu',
    'duration': '3:15',
    'fileName': 'song2.mp3',
    'image' : 'humma.jpg'
  },
  {
    'name': 'Nashe Si Chadh Gayi',
    'artist': 'Arijit Singh',
    'album': 'Befikre',
    'duration': '2:34',
    'fileName': 'song3.mp3',
    'image' : 'befikre.jpg'
  },
  {
    'name': 'The Breakup Song',
    'artist': 'Nakash Aziz, Arijit Singh, Badshah, Jonita Gandhi',
    'album': 'Ae Dil Hai Mushkil',
    'duration': '2:29',
    'fileName': 'song4.mp3',
    'image' : 'mushkil.jpg'
  }
];

// When the user 'logs in', hide the login page and reveal the dashboard.
$('.welcome-screen button').on('click', function() {
  var name = $('#name-input').val();
  if(name.length > 3) {
    var message = "Welcome, " + name;
    $('.user-name a').text(message);
    $('.welcome-screen').addClass('hidden');
    $('.main').removeClass('hidden');
    $('body').css('padding-top', '40px');
    $('body').css('padding-bottom', '80px');
  }
  else {    
    $('#name-input').addClass('error');
   }
});

// When the user clicks on the play/pause icon, toggle the audio accordingly.
$('.play-icon').on('click', function() {
  toggleSong();
});

// Toggle the song whenever the user presses the spacebar outside any input field.
$('body').on('keypress', function(event) {
  if(event.keyCode == 32 && event.target.tagName != 'INPUT') {
    toggleSong();
  }
});

// This function toggles the audio, regardless of how the song is toggled,
// i.e., using the Play/Pause button, etc.
function toggleSong() {
  var song = document.querySelector('audio');
  if(song.paused) {
    $('.play-icon').removeClass('fa-play').addClass('fa-pause');  // If the song is paused, start playing it
    song.play();                                                  // and change the icon of Toggle button.
  }
  else {
    $('.play-icon').removeClass('fa-pause').addClass('fa-play');  // If the song is playing, pause it
    song.pause();                                                 // and change the icon of Toggle button.
  }
}

// Update the current time of the song as well as the total duration of the song.
function updateCurrentTime() {
  var song = document.querySelector('audio');
  var currentTime = fancyTimeFormat(Math.floor(song.currentTime));  // Get the current time and the duration in HH:MM:SS format.
  var duration = fancyTimeFormat(Math.floor(song.duration));
  $('.time-elapsed').text(currentTime); // Update the current time of the audio.
  $('.song-duration').text(duration); // Update the duration of the audio.
}

// The following function runs when the page is loaded.
// It is related to performing load-time tasks, such as loading the playlist, checking the local storage, etc.
$(document).ready(function() {
  // Update the number of songs in the playlist.
  $('#num-of-songs').text(songs.length);

  // Load the song that was last played when the user closed/refreshed the page, by accessing the Local Storage of the browser.
  if(!localStorage.getItem('name')) {     // If there is no song data previously stored in the browser's local storage...
    changeCurrentSongDetails(songs[0]);   // Load the details of the first song to the player controls.
  }
  else {                                  // If there is song data saved on the local storage...
    var audio = document.querySelector('audio');
    // Access the various items in the local storage and assign their values appropriately.
    currentSongNumber = localStorage.getItem('current-song-number');
    audio.src = localStorage.getItem('fileName');
    audio.currentTime = localStorage.getItem('current-time');
    $('.current-song-name').text(localStorage.getItem('name'));
    $('.current-song-album').text(localStorage.getItem('album'));
    $('.current-song-image').attr('src', 'img/' + localStorage.getItem('image'));
  }

  // Populate the playlist table.
  for(var i=0; i<songs.length; ++i) {
    var obj = songs[i];
    var name = '#song' + (i+1);
    var song = $(name);
    song.find('.song-number').text(i+1);
    song.find('.song-name').text(obj.name);
    song.find('.song-artist').text(obj.artist);
    song.find('.song-album').text(obj.album);
    song.find('.song-length').text(obj.duration);
    addSongNameClickEvent(obj, i+1);    // Add click events to each song in the table.
  }
  updateCurrentTime();  // Update the current time and duration on the player.
  setInterval(function() {
    updateCurrentTime();
  }, 1000);

  $('#songs').DataTable({   // Initialise the DataTable.
    paging: false
  });
});

// This function returns the given time value in the HH:MM:SS format.
function fancyTimeFormat(time) {
  // Hours, minutes and seconds
  var hrs = ~~(time / 3600);
  var mins = ~~((time % 3600) / 60);
  var secs = time % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";

  if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

// This function adds click events to every song in the playlist table.
function addSongNameClickEvent(song, position) {
  var songId = '#song' + position;
  var fileName = song.fileName;
  $(songId).on('click', function() {
    currentSongNumber = (position > 0 && position <= songs.length) ? position : ((position > songs.length) ? songs.length : 1);
    var audio = document.querySelector('audio');
    if(audio.src.search(fileName) != -1) {  // If the name of the song is contained in the src value of the audio...
      toggleSong();                         // Toggle the song.
    }
    else {
      audio.src = fileName;                 // Otherwise set the src to the new fileName value and then play the song and update the player.
      toggleSong();
      changeCurrentSongDetails(song);
    }
  });
}

// This function changes the image, song name and album name displayed on the player whenever the current song is changed.
function changeCurrentSongDetails(song) {
  $('.current-song-name').text(song.name);
  $('.current-song-album').text(song.album);
  $('.current-song-image').attr('src', 'img/' + song.image);
}

// Updates the progress bar of the player as the song progresses with time.
$('audio').on('timeupdate', function() {
  var audio = document.querySelector('audio');
  $('.progress-filled').stop().animate({'width': (audio.currentTime) / audio.duration * 100 + '%'}, 250, 'linear');
});

// The 'scrub' function: it updates the current time whenever the user clicks
// anywhere on the progress bar.
$('.player-progress').on('click', function(event) {
  var audio = document.querySelector('audio');
  var progress = document.querySelector('.player-progress');

  var scrubTime = (event.offsetX / progress.offsetWidth) * audio.duration;
  audio.currentTime = scrubTime;
});

// The following code is to implement the looping functionality.
// Toggle the looping ability.
$('.fa-repeat').on('click',function() {
    $('.fa-repeat').toggleClass('disabled')
    willLoop = 1 - willLoop;
});

//The actual looping code. Runs only if looping is enabled.
$('audio').on('ended', function() {
  // Run the following code only if willLoop == 1, i.e., if the player will loop.
  if(willLoop) {
    var audio = document.querySelector('audio');
    if(currentSongNumber < songs.length) {
      // PLay the next song
      var nextSongObj = songs[currentSongNumber];
      audio.src = nextSongObj.fileName;   // Change the source
      toggleSong();   // Play the next song
      changeCurrentSongDetails(nextSongObj);  // Change the song details in the player controls
      currentSongNumber++;  // Increment the current song number.
    }
    else {
      // Play the first song
      audio.src = songs[0].fileName;
      toggleSong();
      changeCurrentSongDetails(songs[0]);
      currentSongNumber = 1;
    }
  }
});
// End of code for looping functionality.

$('.fa-random').on('click', function() {
  $('.fa-random').toggleClass('disabled');
  willShuffle = 1 - willShuffle;
});

$('audio').on('ended', function() {
  if(willShuffle) {
    audio = document.querySelector('audio');
    currentSongNumber = Math.floor((Math.random() * 4) + 1);
    var nextSongObj = songs[currentSongNumber - 1];
    audio.src = nextSongObj.fileName;
    toggleSong();
    changeCurrentSongDetails(nextSongObj);
  }
});

// Code for the 'Next' button.
$('.fa-step-forward').on('click', function() {
  var audio = document.querySelector('audio');
  if(currentSongNumber < songs.length) {
    currentSongNumber++;
    var nextSongObj = songs[currentSongNumber - 1];
    audio.src = nextSongObj.fileName;
    toggleSong();
    changeCurrentSongDetails(nextSongObj);
  }
  else {
    currentSongNumber = 1;
    audio.src = songs[0].fileName;
    toggleSong();
    changeCurrentSongDetails(songs[0]);
  }
});

// Code for the 'Previous' button.
$('.fa-step-backward').on('click', function() {
  var audio = document.querySelector('audio');
  if(currentSongNumber > 1) {
    currentSongNumber--;
    var prevSongObj = songs[currentSongNumber - 1];
    audio.src = prevSongObj.fileName;
    toggleSong();
    changeCurrentSongDetails(prevSongObj);
  }
  else {
    currentSongNumber = songs.length;
    audio.src = songs[currentSongNumber - 1].fileName;
    toggleSong();
    changeCurrentSongDetails(songs[currentSongNumber - 1]);
  }
});

// Jump to the first song.
$('.fa-fast-backward').on('click', function() {
  skipToFirstOrLastSong('first');
});

// Jump to the last song.
$('.fa-fast-forward').on('click', function() {
  skipToFirstOrLastSong('last');
});

// Common code for jumping to the first or the last song.
function skipToFirstOrLastSong(index) { // index is the value received through the click events.
  var audio = document.querySelector('audio');
  currentSongNumber = (index === 'first') ? 1 : songs.length; // If index === 'first' then play first song, else the last one.
  audio.src = songs[currentSongNumber - 1].fileName;
  toggleSong();
  changeCurrentSongDetails(songs[currentSongNumber - 1]);
}

// Code for the volume slider.
$('.player-slider').on('change', function() {
  var audio = document.querySelector('audio');
  audio.volume = this.value;
});

// Code to mute and unmute the audio.
$('#volume-toggle').on('click', function() {
  $('#volume-toggle').toggleClass('fa-volume-up').toggleClass('fa-volume-off');
  var audio = document.querySelector('audio');
  audio.muted = !audio.muted;
});

// The following code is meant to use the Web Speech API.
$('.fa-microphone').on('click', function() {
  recognition.start();
  console.log('Started!');
});

recognition.onresult = function(event) {
  var last = event.results.length - 1;
  var transcript = event.results[last][0].transcript;
  // alert(transcript);
  var song = document.querySelector('audio');
  if(song.paused && transcript.toUpperCase() === 'PLAY') {
    // $('.player-progress').hide();
    $('.play-icon').removeClass('fa-play').addClass('fa-pause');
    song.play();
    // alert("Is paused: " + song.paused);
    console.log("Is paused: " + song.paused);
  }
  else if(transcript.toUpperCase() === 'PAUSE') {
    // $('.player-progress').show();
    $('.play-icon').removeClass('fa-pause').addClass('fa-play');
    song.pause();
    // alert("Is paused: " + song.paused);
    console.log("Is paused: " + song.paused);
  }
};

recognition.onspeechend = function() {
  recognition.stop();
};

// Code to play local files.
var jsmediatags = window.jsmediatags; // Instantiate a jsmediatags object

$('#my-file').on('change', function(event) {  // Triggered whenever we choose a file
  var file = event.target.files[0];           // Select the first file from all the files we have selected
  var reader = new FileReader();              // Instantiate a FileReader object
  $(reader).on('load', function() {
    var audio = document.querySelector('audio');
    audio.src = this.result;                  // Set the audio's source to the result of the event
    toggleSong();                             // Play the song
  });
  reader.readAsDataURL(file);                 // The file is to be read as a URL

  // The following code is meant to extract the audio metadata from the selected local file.
  jsmediatags.read(file, {
    onSuccess: function(tag) {    // onSuccess triggers in the event of a successful reading operation, as opposed to onError.
      document.querySelector('.current-song-album').innerHTML = tag.tags.album;   // Set the album name
      document.querySelector('.current-song-name').innerHTML = tag.tags.title;    // Set the song title
      document.querySelector('.current-song-image').setAttribute('src', 'img/generic.svg'); //Set a generic music icon in place of an album cover
    }
  });
});

// This function is called whenever the user refreshes/closes the window.
// It is meant to save the data of the current song in the Local Storage so that the same song plays when the user revisits the page.
function saveSong() {
  if(typeof(Storage) !== undefined) {   // If the browser supports localStorage, save the details of the current song in the localStorage object.
    var audio = document.querySelector('audio');
    var songObj = songs[currentSongNumber - 1];
    localStorage.setItem('name', songObj.name);
    localStorage.setItem('album', songObj.album);
    localStorage.setItem('artist', songObj.artist);
    localStorage.setItem('duration', songObj.duration);
    localStorage.setItem('fileName', songObj.fileName);
    localStorage.setItem('image', songObj.image);
    localStorage.setItem('current-time', audio.currentTime);
    localStorage.setItem('current-song-number', currentSongNumber);
  }
  else {    // If localStorage is not supported, display an error message in the log.
    console.log('Web Storage not supported.');
  }
}

// WARNING! May not work on all browsers!
// When the user refreshes/closes the window, save the details of the current song by calling saveSong() function.
$(window).on('unload', function() {
  console.log('Saving song...');
  saveSong();
  console.log('Song saved!');
});
