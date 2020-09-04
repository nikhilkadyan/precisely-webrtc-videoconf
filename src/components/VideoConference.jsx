import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import socketIOClient from "socket.io-client";
import ConferenceControls from "./ConferenceControls";
import "./assets/css/style.css";

const ENDPOINT = "https://precisely-learnage.herokuapp.com/";
let stream;

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

  const muteAudio = () => {
    console.log("Audio Muted");
    stream.getAudioTracks()[0].enabled
      ? (stream.getAudioTracks()[0].enabled = false)
      : (stream.getAudioTracks()[0].enabled = true);
  };
  const endConference = () => {
    leaveConference();
  };
  const shareLink = () => {
    console.log("Share");
  };

  const socket = socketIOClient(ENDPOINT);
  const myPeer = new Peer();
  const room_id = match.params.conId;

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    const div = document.createElement("div");
    div.appendChild(video);
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    document.getElementById("vid-conf").append(div);
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

  useEffect(async () => {
    myVideo.current.muted = true;
    myPeer.on("open", (id) => {
      localStorage.setItem("user_uid", id);
      socket.emit("join-room", { roomID: room_id, uid: id });
    });
    // Handle Streams
    stream = await navigator.mediaDevices.getUserMedia(mediaSettings);
    myVideo.current.srcObject = stream;
    // eslint-disable-next-line
  }, []);

  // Handle when connecting to other users
  myPeer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  });

  // Handle when new user joins
  socket.on("user-joined", (data) => {
    // if (data.uid === localStorage.getItem("user_uid")) {
    //   console.log("my id");
    // } else {
    connectNewUser(data.uid, stream);
    // }
  });

  window.addEventListener("beforeunload", (ev) => {
    ev.preventDefault();
    leaveConference();

    return (ev.returnValue = "Are you sure you want to close?");
  });

  const leaveConference = () => {
    socket.emit("leave-room", {
      roomID: room_id,
      uid: localStorage.getItem("user_uid"),
    });
  };

  const playVideo = () => {
    myVideo.current.play();
  };

  return (
    <div id="vid-conf-parent">
      <div id="vid-conf">
        <div id="conference-creator">
          <video id="myVideo" ref={myVideo} onLoadedMetadata={playVideo} />
        </div>
      </div>
      <ConferenceControls
        muteAudio={muteAudio}
        endConference={endConference}
        shareLink={shareLink}
      />
    </div>
  );
};

export default VideoConference;
