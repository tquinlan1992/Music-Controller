   
$("#room_name").hide();
      var socket = io();

      socket.on('deck', function(msg){
        console.log(msg.length);
      });

      
      
      
      var songs = [];
     var song_version = 0;
     var song_source = $("#song-source");
     var song_source_dom = document.getElementById("song-source");
     var song_input_search = $("#song-search-input");
     var room_name= false;
     
      var next_version = function() {
        song_version++;
      $("#playing-song-version-info").html("Playing song version "+ parseInt(song_version + 1)+ " out of "+songs.length);
      $("#song-source").attr("src", songs[song_version-1])
      song_source.load();
      song_source_dom.oncanplay = function() {
        update_duration();
      }
          song_source_dom.onerror = function() {
            next_version();
      }
     }
     
     var begin_song = function(){
        song_source_dom.currentTime = 0;
     }

      socket.on('new song urls', function(msg){
        songs = msg.song_urls;
        time = msg.time_to_search;
        $("#time-to-search").html("Took "+msg.time_to_search+" milliseconds to search for versions");
        song_version = 0;
        $("#playing-song-version-info").html("Playing song version "+ parseInt(song_version + 1)+ " out of "+songs.length);
          song_source.attr("src", msg.song_urls[song_version])
          
          song_source.load();
          song_source_dom.onerror = function() {
            next_version();
          }
          song_source_dom.oncanplay = function() {
            update_duration();
            song_source_dom.play();
          }
      });
      
      

      socket.on('new album cover', function(msg){
        $("#cover-background").css('background-image','url('+msg+')');
      });
      
      socket.on('update progress', function(msg){
        current_time = song_source_dom.currentTime;
        console.log(current_time > msg - 1 && current_time < msg + 1 );
        if (current_time > msg - 3 && current_time < msg + 3) {
        }
        else {
          song_source_dom.currentTime = msg;
        }
      })
      
      socket.on('update progress exact', function(msg){
        if (current_time > msg - 1 && current_time < msg + 1) {
        }
        else {
          song_source_dom.currentTime = msg;
        }
      })
      
      socket.on("total users", function(msg){
        $("#total-users").html(msg+" total users");
      });
      
      socket.on("pause", function(msg){
        song_source_dom.pause();
      });
      
      socket.on("play", function(msg){
        song_source_dom.play();
      });
      
      socket.on("next version", function(msg){
         next_version();
      });
      
    
      socket.on("title artist album", function(msg){
          $("#title").html(msg.title);
          $("#artist").html(msg.artist + " - ");
          $("#album").html(msg.album_title);
      });
    
      
      $("#join-room-form").submit(function(e){
        e.preventDefault();
        room_name = $("#join-room-input").val();
        socket.emit("join room", room_name);
        $(this).hide();
        $("#room_name").html("You're in room, "+room_name);
        $("#room_name").show();
      });
      
    
      

      
      
      

      $("#search-form").submit(function(e){
        socket.emit("pause", room_name);
        song_input_search.blur();
        document.getElementById("song-source").pause();
        e.preventDefault();
        var song_search = $("#song-search-input").val();
        if (song_input_search.val().toLowerCase().substring(0, 5) == "play "){
          song_search = song_input_search.val().substring(5);
          }
          
        socket.emit("new song", {song_search: song_search, room_name: room_name});
        song_input_search.val(""); 
      });
      
      

      
      $("#search-form").change(function(){
        setTimeout(function(){
          if (song_input_search.val().toLowerCase().substring(0, 5) == "play "){
            $("#search-form").submit();
            };
        }, 1)
      })
      
  var update_current_position = function(){
    var time = song_progress.value * song_source_dom.duration;
    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time - minutes * 60);
    if (seconds < 10) {
      seconds = "0"+seconds;
    }
    $("#current-position").html(minutes + ":"+seconds);
  }
  
  var update_duration = function() {
    var time = song_source_dom.duration;
    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time - minutes * 60);
    if (seconds < 10) {
      seconds = "0"+seconds;
    }
    $("#duration").html(minutes+":"+seconds);
  }
      
      

     
     
     
     
     
     
var song_progress = document.getElementById("song-progress");



song_source_dom.ontimeupdate = function() {
  song_progress.value = song_source_dom.currentTime / song_source_dom.duration;
  update_current_position();
  socket.emit("update progress", {room_name: room_name, progress: song_source_dom.currentTime});
}
     
song_progress.addEventListener("input", function() {
  song_source_dom.currentTime = song_progress.value * song_source_dom.duration;
  socket.emit("update progress exact", {room_name: room_name, progress: song_source_dom.currentTime});
}, false);

song_source_dom.onplaying = function() {
    $("#play-pause").attr("class","fa fa-pause fa-2x music-controls");
    socket.emit("update progress exact", {room_name: room_name, progress: song_source_dom.currentTime});
    socket.emit("play", room_name);
};

song_source_dom.onpause = function() {
    $("#play-pause").attr("class","fa fa-play fa-2x music-controls");
    socket.emit("pause", room_name);
};

$("#play-pause").click(function(){
  if (song_source_dom.paused) {
    song_source_dom.play();
  } else {
    song_source_dom.pause();
  }
})

$("#controls-next-version").click(function(){
  socket.emit("next version", room_name);
  next_version();
})

$("#backward").click(function() {
    begin_song();
});