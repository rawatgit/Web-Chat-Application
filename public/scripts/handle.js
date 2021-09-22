$(function () {
    var socket = io();
    const room = $('#roomName').val();
    const randomNum = Math.round(Math.random(1,1000) * 10000);
    const uName = $('#uName').val();
    let name = uName ?  uName : `user`+randomNum;
    const spritesTypes = ['male', 'female', 'human', 'avataaars'];//, 'initials', 'bottts', 'gridy', 'code']
    const randomSprite = Math.floor(Math.random() * Math.floor(spritesTypes.length));
    const spriteAddress = `https://avatars.dicebear.com/api/${spritesTypes[randomSprite]}/${name}.svg?mood[]=happy`
    let avatarImg = `<img src='${spriteAddress}'>`
    name = `${avatarImg} <label>${name}</label>`;
    var quill = new Quill('#editor', {
                        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['link', 'blockquote', 'code-block', 'image'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                ['clean']        
            ]
        },
        placeholder: '  Enter your message',
        theme: 'snow'
    });
    //set css for user
    const anongerColorChatName = ['#D93D27','#EFA53A', '#E2E482', '#E0BE65', '#F29D09'];
    const randomNumForChatName = Math.round(Math.random(0, anongerColorChatName.length - 1) * 10); 
    const chatColor = anongerColorChatName[randomNumForChatName];
    socket.emit('join', { userName: uName, roomId: room });
    var typing=false;
    var timeout=undefined;
    function typingTimeout(){
        typing=false
        socket.emit('typing', {user:uName, typing:false, roomId: room})
    }
    const sendMessage = () => {
        const message = $('#editor .ql-editor').html();
        if($('#editor .ql-editor').hasClass('ql-blank')){
            alert('You forget to add message.');
            return false;
        }
        socket.emit('chatMsg', { message, room, name, chatColor });
        $('#editor .ql-editor').html('');
        return false;
    }
    $('form').submit(() => {
        return sendMessage();
    });
    $('#editor').on('keydown', (e) => {
        if(e.ctrlKey && ( e.which === 13 )) {
            return sendMessage();
        }
        if(e.which!=13){
            typing=true
            //console.log({user:uName, typing:true});
            socket.emit('typing', {user:uName, typing:true, roomId: room});
            clearTimeout(timeout);
            timeout=setTimeout(typingTimeout, 3000);
          }else{
            clearTimeout(timeout);
            typingTimeout();
          }
    });
    socket.on(room, function ({message, userCount, chatColor}) {
        const messageHTML = $(message).html();
        if($(messageHTML).hasClass('notification') && $(messageHTML).find('username').text() === uName) {
            return;
        }
        $('#messages').append(message);
        console.log(userCount);
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    });
    $('#enter-room').on('click', ()=>{
        const roomId  = $('#roomId').val();
        const userName = $('#userName').val();
        const url =  `/${roomId}?name=${userName}`;
        window.location.href = url;
    });
    window.addEventListener('beforeunload', function () {
        socket.emit('chatLeft', {uName, room});
    });
    socket.on(`display${room}`, (data) =>{
        if(data.typing==true){
            if(data.user !== uName) {
                $('.typing').text(`${data.user} is typing...`)
            }   
        } 
        else{
            $('.typing').text("")
        }
    });
});