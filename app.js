const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const {
    uniqueNamesGenerator, 
    names,  
    colors,
    NumberDictionary
} = require('unique-names-generator');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
//Handlebars
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');

//Static folder
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res, next) => {
    const { name } = req.query;
    const roomConfig = {
        dictionaries: [colors],
        length: 1
    }
    const nameConfig = {
        dictionaries: [names],
        length: 1
    }
    const randomRoomName =  `${uniqueNamesGenerator(roomConfig)}${NumberDictionary.generate({ min: 100, max: 999 })}`;
    const randomUserName =  `${uniqueNamesGenerator(nameConfig)}${NumberDictionary.generate({ min: 100, max: 999 })}`;  
    res.render('index', {
        layout: 'indexLayout',
        data: {randomRoomName, randomUserName}
    });
});
app.get('/:room', (req, res, next) => {
    const {
        room
    } = req.params;
    const { name } = req.query;
    res.render('main', {
        layout: 'mainLayout',
        data: { room, uName: name }
    });
});
io.on('connection', function (socket) {
    socket.on('join', ({ userName, roomId }) => {
        io.emit(roomId, { message: `<li><div class="notification"><username>${userName}</username> joined this conversation.</div></li>`});
    });
    socket.on('chatMsg', ({message, room, name, chatColor}) => io.emit(room, { message: `<li class="user-message"><div class='chat-name' style='background:${chatColor}'>${name}:</div> <div class='chat-pan'>${message}</div></li>`, userCount: io.engine.clientsCount}));
    socket.on('chatLeft', ({room, uName}) =>{
        io.emit(room, { message: `<li class="notification"><username>${uName}</username> left the room.</div></li>`});
    });
    socket.on('typing', data =>{
        if(data.typing==true) {
            //console.log(data.roomId);
            io.emit(`display${data.roomId}`, data);
        }
        else {
           io.emit(`display${data.roomId}`, data);
        }
    });
});

const PORT = process.env.PORT || 3001;
http.listen(PORT, console.log(`Server running on ${PORT}`));