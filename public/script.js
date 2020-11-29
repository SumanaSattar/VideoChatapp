
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host:'/',
    port:'3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers= {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
        addVideoStream(myVideo, stream);

        myPeer.on('call', call => {// when new user call answer the call and show our stream and by writing this code u can see two users in the other browser
            call.answer(stream)
            const video = document.createElement('video')// by writing this code both browsers will be able to see two videos
            call.on('stream', userVideoStream => {
              addVideoStream(video, userVideoStream)
            })
          })
        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream)//send our current video stream to new user
          })
  })
  socket.on('user-disconnected', userId => {// when use disconnects then this will run and some code is writen in serverjs as well and we are listneing here
    if (peers[userId]) peers[userId].close()// it will check if it is true then it will close the video 
  })

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID ,id)
})


function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(video)
  }
  
  
  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)// this will send our video to the new user by stream we are sending our video and audio stream
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {// then we will listen to the event stream 
      addVideoStream(video, userVideoStream) // userVideoStream is the video the new user and sending us now we want to add it to our videos
    })//video in this function is the one we created in this function
    call.on('close', () => {
      video.remove()
    })
    peers[userId] = call // peers id will be equal to the call we created
    
  }