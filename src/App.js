import React, { useEffect } from 'react';
import socketIOClient from "socket.io-client";
import Peer from 'peerjs';
import './styles.css';
const ENDPOINT = "https://precisely-learnage.herokuapp.com/";

function App() {

  const socket = socketIOClient(ENDPOINT);
  const myPeer = new Peer();
  const room_id = window.location.pathname;

  // Add new user steam to window
  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    })
    document.getElementById('video-grid').append(video);
  }

  // Connect to new user
  const connectNewUser = (userID, stream) => {
    const call = myPeer.call(userID, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    });
    call.on('close', () => {
      video.remove();
    })
    socket.on('user-left', data => {
      if(userID === data.uid){
        video.remove();
      }
      console.log(data)
    })
  }

  useEffect(() => {
    const myVideo = document.getElementById('myVideo');
    myVideo.muted = true;
    // Emit to room on joining
    myPeer.on('open', (id) => {
      localStorage.setItem("user_uid", id);
      socket.emit('join-room', { roomID: room_id, uid: id });
    });
    // Handle Streams
    window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      // Set current user stream
      addVideoStream(myVideo, stream);

      // Handle when connecting to other users
      myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })

      // Handle when new user joins
      socket.on('user-joined', data => {
        connectNewUser(data.uid, stream)
      })
    })

    // return () => {
    //   socket.emit('leave-room', { roomID: room_id, uid: localStorage.getItem('user_uid') });
    // }

  // eslint-disable-next-line
  }, [myPeer, socket]);

  window.addEventListener("beforeunload", (ev) => 
  {  
    ev.preventDefault();
    socket.emit('leave-room', { roomID: room_id, uid: localStorage.getItem('user_uid') });

    return ev.returnValue = 'Are you sure you want to close?';
  });

  return (
    <div className="App">
      <video id="myVideo" />
      <div id="video-grid"></div>
    </div>
  );
}

export default App;
