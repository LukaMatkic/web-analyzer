//MAKE A CONNECTION
var socket = io.connect('http://localhost:3001');

//QUERY DOM
var btn = document.getElementById('Scrapebtn');
var span = document.getElementById('span');

//Emit Events
btn.addEventListener('click', function(){
    socket.emit('Scraping', {
        message: 'Emitted successfully!'
    });
});

//Listen for Events
socket.on('Scraping', function(data){
    console.log('\nThis is frontend: ' + data.message + '\n');
    span.innerHTML += 'Data.message: ' + data.message;
});
