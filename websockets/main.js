var cheerio = require('cheerio');
var request = require('request');
var start;

var get_title_artist_album = function(search, callback) {
    
        request({
          method:"GET",
          url: "http://www.songlyrics.com/index.php?section=search&searchW="+search.replace(/ /g, "+")+"&submit=Search&searchIn1=artist&searchIn2=album&searchIn3=song&searchIn4=lyrics",
        }, function(songlyricserror,songlyrics_ajaxresponse, songlyrics_body) {
                
                $_songlyrics = cheerio.load(songlyrics_body);
                var title = $_songlyrics(".serpresult >a:nth-of-type(1)").attr("title");
                var artist = $_songlyrics(".serpdesc-2 > p >a:nth-of-type(1)").html();
                var album_title = $_songlyrics(".serpdesc-2 > p >a:nth-of-type(2)").html();
                callback({title: title, artist: artist, album_title: album_title});
                
        });
        
}




var get_song_urls = function (search, callback) {
    start = new Date();
    var hrstart = process.hrtime();
    var song_urls = []; 
    var count = 0;
    var callback_function = function(){
                                    if (count > 4) {
                                        var finish = new Date();
                                        var difference = new Date();
                                        difference.setTime(finish.getTime() - start.getTime());
                                        console.log(difference.getMilliseconds());
                                        hrend = process.hrtime(hrstart);
                                        console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1]/1000000);
                                        callback({song_urls:song_urls, time_to_search: difference.getMilliseconds()});
                                        
                                    }
    }
       
    
    
    
    request({
       method:"GET",
       url: "http://mp3pm.com/s/f/"+search,
     }, function(mp3pm_error, mp3pm_ajaxresponse, mp3pm_body) {
             
            $_mp3pm = cheerio.load(mp3pm_body);
            $_mp3pm('.cplayer-sound-item').each(function() {
                     
                     var temp_src = $_mp3pm(this).attr("data-sound-url");
                     song_urls.push(temp_src);
                     
                     
            });
            count++;
            callback_function();
            console.log("mp3pm");
                        
     });
    
    request({
       method:"GET",
       url: "http://emp3world.to/search/"+search.replace(/ /g, "_")+"_mp3_download.html",
     }, function(emp3world_error, emp3world_ajaxresponse, emp3world_body) {
             
            $_emp3world = cheerio.load(emp3world_body);
            $_emp3world('a:contains("Download")').each(function() {
                     
                     var temp_src = $_emp3world(this).attr("href");
                     if (temp_src.substring(temp_src.length-4) == ".mp3") {
                        song_urls.push(temp_src);
                     }
                    
            });
        count++;
        callback_function();
        console.log("emp3world");
     });
                     
    /*request({
       method:"GET",
       url: "http://www.laguband.com/mp3/"+search.replace(/ /g, "-")+".html",
     }, function(laguband_error, laguband_ajaxresponse, laguband_body) {
     
           
        $_laguband = cheerio.load(laguband_body);
        $_laguband('.mp3download').each(function() {
                 
                 var temp_src = $_laguband(this).attr("href");
                 
                 song_urls.push(temp_src);
    
                 
        });
    count++;
    callback_function();
    console.log("laguband");
     });            */  

                     

    request({
      method:"GET",
      url: "https://mp3juices.is/search?q="+search+"&hash=49d114ab21febe79nrxslc",
    }, function(metadataerror,metadata_ajaxresponse, metadata_body) {
       
      $_mp3juices = cheerio.load(metadata_body);
      
      $_mp3juices('a:contains("Download")').each(function() {
       
       song_urls.push($_mp3juices(this).attr("href"));

      });
    count++;
    callback_function();
    console.log("mp3juices");
    });                             
                
    request({
       method:"GET",
       url: "https://mp3skull.lu/download/"+search.replace(/ /g, "-")+"-mp3.html",
     }, function(mp3skull_error, mp3skull_ajaxresponse, mp3skull_body) {

        $_mp3skull = cheerio.load(mp3skull_body);
        $_mp3skull("a").each(function() {
            var temp_src = $_mp3skull(this).attr("data-href");
            if ($_mp3skull(this).html() == "Download" && temp_src.substring(temp_src.length-4) == ".mp3") {
                
                song_urls.push(temp_src);

            }
                 
        });
    count++;
    callback_function();
    console.log("mp3skull");
     });
    
    request({
       method:"GET",
       url: "http://mp3goear.com/mp3/"+search.replace(/ /g, "-")+".html",
     }, function(mp3goear_error, mp3goear_ajaxresponse, mp3goear_body) {
            $_mp3goear = cheerio.load(mp3goear_body);
            $_mp3goear('a:contains("Download")').each(function() {
                     
                     var temp_src = $_mp3goear(this).attr("data-href");
                     song_urls.push(temp_src);

                     
            });   
    count++;
    callback_function();
    console.log("mp3goear");
    });
                                        
                                     
}

var get_album_cover = function (search, callback) {

 
        
                  request({
                    method:"GET",
                    url: "http://www.covermytunes.com/search.php?search_query="+search.replace(/ /g, "+")+"&x=0&y=0",
                  }, function(covermytuneserror,covermytunes_ajaxresponse, covermytunes_body) {
                    
                    $_covermytunes = cheerio.load(covermytunes_body);
                    var temp_image_src = $_covermytunes(".ProductImage > a > img").attr("src");
                    if (typeof temp_image_src != 'undefined') {
                        var image_src = temp_image_src.replace(/170/g, "600");
                        callback(image_src)
                    } else {
                        callback("");
                    }
                    
                 
                  });
                  
        

    
}




var connected_sockets = [];
var remove_disconnected_socket = function(socket_id) {
    for (i=0; i<connected_sockets.length;i++) {
        if (connected_sockets[i] == socket_id) {
            connected_sockets.splice(i, 1);
        }
    }
}

var rooms = [];
var join_room = function(room_name, socket_id) {
    var room_exists = false;
    for (i in rooms){
        if (rooms[i].room_name == room_name) {
            rooms[i].socket_ids.push(socket_id);
            room_exists = true;
        }
    }
    if (!room_exists) {
        rooms.push({room_name: room_name, socket_ids: [socket_id]});
    }
}

var update_room_socket_ids = function(room_name, updater_socket_id) {
    var temp_socket_ids = [];
    for (i in rooms){
        if (rooms[i].room_name == room_name) {
            for (a in rooms[i].socket_ids){
                if (rooms[i].socket_ids[a] != updater_socket_id) {
                    temp_socket_ids.push(rooms[i].socket_ids[a]);
                }
            }
        }
    }
    return temp_socket_ids;
}



module.exports = function(io){
  
    io.on('connection', function(socket){
        
        connected_sockets.push(socket.id);
        io.emit("total users", connected_sockets.length);
    
        socket.on('disconnect', function() {
            remove_disconnected_socket(socket.id);
            io.emit("total users", connected_sockets.length);
        });
       
       
        socket.on('new song', function(msg){
            var temp_socket_ids = update_room_socket_ids(msg.room_name, socket.id);
            get_song_urls(msg.song_search, function(get_song_urls_data) {
                
                if (msg.room_name != false) {
                    for (i in temp_socket_ids){
                        var socket_to_emit = io.sockets.connected[temp_socket_ids[i]]
                        if (typeof socket_to_emit != 'undefined') {
                            socket_to_emit.emit("new song urls", get_song_urls_data);
                        }
                    };
                }
                socket.emit('new song urls', get_song_urls_data);
                
            });
            get_title_artist_album(msg.song_search, function(get_title_artist_album_data){
                
                if (msg.room_name != false) {
                    for (i in temp_socket_ids){
                        var socket_to_emit = io.sockets.connected[temp_socket_ids[i]]
                        if (typeof socket_to_emit != 'undefined') {
                            socket_to_emit.emit("title artist album", get_title_artist_album_data);
                        }
                    };
                }
                socket.emit("title artist album", get_title_artist_album_data); 

                get_album_cover(get_title_artist_album_data.artist + " " +  get_title_artist_album_data.album_title, function(cover) {
                          for (i in temp_socket_ids){
                              var socket_to_emit = io.sockets.connected[temp_socket_ids[i]]
                              if (typeof socket_to_emit != 'undefined') {
                                  socket_to_emit.emit('new album cover', cover);
                              }
                          };
                         socket.emit('new album cover', cover);
                });
                 
            
            });

        });
        
        socket.on("update progress", function(msg){
            var temp_socket_ids = update_room_socket_ids(msg.room_name, socket.id);
            for (i in temp_socket_ids){
                var socket_to_emit = io.sockets.connected[temp_socket_ids[i]]
                if (typeof socket_to_emit != 'undefined') {
                    socket_to_emit.emit("update progress", msg.progress);
                }
            };
        })
        
        socket.on("update progress exact", function(msg){
            var temp_socket_ids = update_room_socket_ids(msg.room_name, socket.id);
            for (i in temp_socket_ids){
                var socket_to_emit = io.sockets.connected[temp_socket_ids[i]]
                if (typeof socket_to_emit != 'undefined') {
                    socket_to_emit.emit("update progress exact", msg.progress);
                }
            };
        })
        
        socket.on("join room", function(msg){
            join_room(msg, socket.id);
        })
        
        socket.on("pause", function(msg){
                  var temp_socket_ids = update_room_socket_ids(msg, socket.id);
                  for (i in temp_socket_ids){
                      var socket_to_emit = io.sockets.connected[temp_socket_ids[i]]
                      if (typeof socket_to_emit != 'undefined') {
                          socket_to_emit.emit("pause", "");
                      }
                  };
        })
        
        socket.on("play", function(msg){
                  var temp_socket_ids = update_room_socket_ids(msg, socket.id);
                  for (i in temp_socket_ids){
                      var socket_to_emit = io.sockets.connected[temp_socket_ids[i]]
                      if (typeof socket_to_emit != 'undefined') {
                          socket_to_emit.emit("play", "");
                      }
                  };
        })

        socket.on("next version", function(msg){
                  var temp_socket_ids = update_room_socket_ids(msg, socket.id);
                  for (i in temp_socket_ids){
                      var socket_to_emit = io.sockets.connected[temp_socket_ids[i]]
                      if (typeof socket_to_emit != 'undefined') {
                          socket_to_emit.emit("next version", "");
                      }
                  };
        })


    

  
  



    });
   
};




