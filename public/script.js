
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host:'/',
    port:'3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
myVideo.style.width="300px"
myVideo.style.height="300px"
let videof=""

const peers= {}

let stopV = document.getElementById("TurnOffFD")
let startV = document.getElementById("TurnOnFD")
let list1 = document.getElementById("list1");
let list2 = document.getElementById("list2");
let list3 = document.getElementById("list3");
let list4 = document.getElementById("list4");
const startEvaluationBtn = document.getElementById("startEvaluationBtn");
let interval = "";
const canvasElement = document.getElementById('canvas');
const snapSoundElement = document.getElementById('snapSound');
let timeStop = false;
let neutral = 0;
let happy = 0;
let sad = 0;
let surprised = 0;
let disgusted = 0;
let angry = 0;
let fearful = 0;
let highValus =[] ;
let iteration =0;

startEvaluationBtn.addEventListener('click',individualEvaluation);

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    
    
  ]).then(console.log("i m loaded"))

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
    console.log(video)
    videof=video;
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
  function faceDetection() {
      console.log(videof.height)
    //video.addEventListener('play', () => {
      neutral = 0;
      happy = 0;
      sad = 0;
      surprised = 0;
      disgusted = 0;
      angry = 0;
      fearful = 0;
        const canvas = faceapi.createCanvasFromMedia(videof)
        videoGrid.append(canvas)
        console.log(canvas)
        const displaySize = { width: videof.width, height: videof.height }
        faceapi.matchDimensions(canvas, displaySize)
         var interval = setInterval(async () => {
           if  (! timeStop) {
          console.log(timeStop)
          const detections = await faceapi.detectAllFaces(videof, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
          const resizedDetections = faceapi.resizeResults(detections, displaySize)
          console.log(resizedDetections[0].expressions)
          const sorted = Object.entries(resizedDetections[0].expressions).sort(([,a],[,b]) => a-b);
          console.log(sorted[6][0]);
          highValus.push (sorted[6][0]);
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
          faceapi.draw.drawDetections(canvas, resizedDetections)
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections)}
        }, 300)
      
      }

      function individualEvaluation() {
  
        console.log("i am in time out");
        setTimeout (() => {
             
            console.log(iteration);
            faceDetection();
            expressionsCalc();
            console.log("finish evaluation");
            if(iteration <= 5){
             iteration++;
      
           individualEvaluation();
           
            }else{ 
              iteration = 0;
              timeStop=true;
       
             }
          
        
          }, 1000);
          timeStop=false;
      }

      function expressionsCalc() {
        highValus.forEach(element => {
          switch(element) {
            case 'neutral':
              neutral++;
                break;
            case 'happy':
              happy++;
                break;
            case 'sad':
              sad++;
                break;
            case 'surprised':
              surprised++;
                break;
            case 'disgusted':
              disgusted++;
                break;
            case 'angry':
              angry++;
                break;  
             case 'fearful':
              fearful++;
                break;   
        }
        })
        persentageCalcul() 
}
function persentageCalcul() {

    let persentageHappy = Math.round((happy / highValus.length) * 100);
    console.log(persentageHappy);
    console.log(highValus.length);
   
    let persentageNuetral = Math.round((neutral / highValus.length) * 100);
    console.log(persentageNuetral);
   
    let persentageSad= Math.round((sad / highValus.length) * 100);
    console.log(persentageSad);
   
    let persentageSurprised= Math.round((surprised / highValus.length) * 100);
    console.log(persentageSurprised);
   
    let persentageAngry= Math.round((angry / highValus.length) * 100);
    console.log(persentageAngry);
   
    let persentageFeraful= Math.round((fearful / highValus.length) * 100);
    console.log(persentageFeraful);
   
    let persentageDesgusted= Math.round((disgusted / highValus.length) * 100);
    console.log(persentageDesgusted);
   
    if (iteration === 3 ) {
        list1.innerHTML = 
   `<li>Neutral: ${persentageNuetral}%</li>
    <li>Happy: ${persentageHappy}%</li>
    <li>Sad: ${persentageSad}%</li>
    <li>Suprised: ${persentageSurprised}%</li>
    <li>Disgusted: ${persentageDesgusted}%</li>
    <li>Angry: ${persentageAngry}%</li>
    <li>Fearful: ${persentageFeraful}%</li>`;
    persentageNuetral = 0;
    persentageHappy = 0;
    persentageSad = 0;
    persentageSurprised = 0;
    persentageDesgusted = 0;
    persentageAngry = 0;
    persentageFeraful = 0;



 } else if (iteration === 4) {
    list2.innerHTML = 
   `<li>Neutral: ${persentageNuetral}%</li>
    <li>Happy: ${persentageHappy}%</li>
    <li>Sad: ${persentageSad}%</li>
    <li>Suprised: ${persentageSurprised}%</li>
    <li>Disgusted: ${persentageDesgusted}%</li>
    <li>Angry: ${persentageAngry}%</li>
    <li>Fearful: ${persentageFeraful}%</li>`;
    persentageNuetral = 0;
    persentageHappy = 0;
    persentageSad = 0;
    persentageSurprised = 0;
    persentageDesgusted = 0;
    persentageAngry = 0;
    persentageFeraful = 0;

 } else if(iteration === 5) {
    list3.innerHTML = 
   `<li>Neutral: ${persentageNuetral}%</li>
    <li>Happy: ${persentageHappy}%</li>
    <li>Sad: ${persentageSad}%</li>
    <li>Suprised: ${persentageSurprised}%</li>
    <li>Disgusted: ${persentageDesgusted}%</li>
    <li>Angry: ${persentageAngry}%</li>
    <li>Fearful: ${persentageFeraful}%</li>`;
    persentageNuetral = 0;
    persentageHappy = 0;
    persentageSad = 0;
    persentageSurprised = 0;
    persentageDesgusted = 0;
    persentageAngry = 0;
    persentageFeraful = 0;

 } else if (iteration === 6) {
    list4.innerHTML = 
   `<li>Neutral: ${persentageNuetral}%</li>
    <li>Happy: ${persentageHappy}%</li>
    <li>Sad: ${persentageSad}%</li>
    <li>Suprised: ${persentageSurprised}%</li>
    <li>Disgusted: ${persentageDesgusted}%</li>
    <li>Angry: ${persentageAngry}%</li>
    <li>Fearful: ${persentageFeraful}%</li>`;
    persentageNuetral = 0;
    persentageHappy = 0;
    persentageSad = 0;
    persentageSurprised = 0;
    persentageDesgusted = 0;
    persentageAngry = 0;
    persentageFeraful = 0;
 }
}
