import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import socketIOClient from "socket.io-client";
import "./assets/css/style.css";
const ENDPOINT = "https://precisely-learnage.herokuapp.com/";

const VideoConference = ({ match }) => {
  const myVideo = useRef();

  const [mediaSettings] = useState({
    // video: true,
    video: {
      width: 300,
      height: 542,
    },
    audio: true,
  });

  const socket = socketIOClient(ENDPOINT);
  const myPeer = new Peer();
  const room_id = match.params.conId;
  console.log(match.params)

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    document.getElementById("vid-conf").append(video);
  };

  // Connect to new user
  const connectNewUser = (userID, stream) => {
    const call = myPeer.call(userID, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
      video.remove();
    });
    socket.on("user-left", (data) => {
      if (userID === data.uid) {
        console.log(data);
        video.remove();
      }
    });
  };

  useEffect(() => {
    const init = async () => {
      myVideo.current.muted = true;
      myPeer.on("open", (id) => {
        localStorage.setItem("user_uid", id);
        socket.emit("join-room", { roomID: room_id, uid: id });
      });
      // Handle Streams
      const stream = await navigator.mediaDevices.getUserMedia(mediaSettings);
      myVideo.current.srcObject = stream;

      // Handle when connecting to other users
      myPeer.on("call", (call) => {
        call.answer(stream);
        console.log(stream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
          addVideoStream(video, userVideoStream);
        });
      });

      // Handle when new user joins
      socket.on("user-joined", (data) => {
        connectNewUser(data.uid, stream);
      });
    }
    init();
    // eslint-disable-next-line
  }, [myPeer, socket]);

  window.addEventListener("beforeunload", (ev) => {
    ev.preventDefault();
    socket.emit("leave-room", {
      roomID: room_id,
      uid: localStorage.getItem("user_uid"),
    });

    return (ev.returnValue = "Are you sure you want to close?");
  });

  const playVideo = () => {
    myVideo.current.play();
  };

  return (
    <div id="vid-conf">
      <div id="conference-creator">
        <video id="myVideo" ref={myVideo} onLoadedMetadata={playVideo} />
      </div>
      {/* <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div> */}
    </div>
  );
};

export default VideoConference;