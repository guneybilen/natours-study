import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import styled from 'styled-components';
import $ from 'jquery';

// const Container = styled.div`
//   height: 100vh;
//   width: 100%;
//   display: flex;
//   flex-direction: column;
// `;

const Div = styled.div`
  display: flex;
  width: 100%;
`;

const Video = styled.video`
  border: 1px solid blue;
  width: 50%;
  height: 50%;
`;

function App() {
  const [yourID, setYourID] = useState('');
  const [count, setCount] = useState(1);
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const socket = useRef();

  $(window).on('beforeunload', function() {
    socket.current.emit('leave');
    //fetch('/api/v1/users/logout');
  });

  useEffect(() => {
    socket.current = io.connect('/');
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      });

    socket.current.on('yourID', id => {
      setYourID(id);
    });
    socket.current.on('allUsers', users => {
      setUsers(users);
    });

    socket.current.on('hey', data => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });
  }, []);

  const addItem = () => {
    setCount({ count: 2 });
  };

  function callPeer(id) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: 'stun:numb.viagenie.ca',
            username: 'sultan1640@gmail.com',
            credential: '98376683'
          },
          {
            urls: 'turn:numb.viagenie.ca',
            username: 'sultan1640@gmail.com',
            credential: '98376683'
          }
        ]
      },
      stream: stream
    });

    peer.on('signal', data => {
      socket.current.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: yourID
      });
    });

    peer.on('stream', stream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    socket.current.on('callAccepted', signal => {
      setCallAccepted(true);
      peer.signal(signal);
    });
  }

  function acceptCall() {
    $('#callbtn').prop('disabled', true)
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });
    peer.on('signal', data => {
      socket.current.emit('acceptCall', { signal: data, to: caller });
    });

    peer.on('stream', stream => {
      partnerVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
  }

  let UserVideo;
  if (stream) {
    UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
  }

  let PartnerVideo;
  if (callAccepted) {
      PartnerVideo = <Video playsInline ref={partnerVideo} autoPlay />;
      $('#callbtn').prop('disabled', true)
  }

  let incomingCall;
  if (receivingCall) {
    incomingCall = (
      <div>
        <h1>{caller} is calling you</h1>
        <button
          onClick={e => {
            e.target.setAttribute('disabled', true);
            acceptCall(e);
          }}
        >
          Accept
        </button>
      </div>
    );
  }
  return (
    <>
      <Div>
        {UserVideo}
        {PartnerVideo}
      </Div>
      <div>
        {Object.keys(users).map(key => {
          if (key === yourID) {
            return null;
          }

          return (
            <button
              onClick={e => {
                e.target.setAttribute('disabled', true);
                callPeer(key);
                addItem();
              }}
              id="callbtn"
            >
              Call {key}
            </button>
          );
        })}
        {incomingCall}
      </div>
    </>
  );
}

export default App;
