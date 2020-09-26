import React, { useEffect, useState } from 'react';

import Amplify from '@aws-amplify/core';
import API, { graphqlOperation } from '@aws-amplify/api';
import '@aws-amplify/pubsub';

import { createMessage } from './graphql/mutations';
import { onCreateMessage } from './graphql/subscriptions';
import { listDoctors, listPatients, messagesByChannelId } from './graphql/queries';

import awsExports from './aws-exports';
import './App.css';

Amplify.configure(awsExports);

function App() {
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [messageBody, setMessageBody] = useState('');

  useEffect(() => {
    API
      .graphql(graphqlOperation(messagesByChannelId, {
        channelID: '1',
        sortDirection: 'ASC'
      }))
      .then((response) => {
        const items = response?.data?.messagesByChannelID?.items;

        if (items) {
          setMessages(items);
        }
      })
  }, []);

  useEffect(() => {
  API
    .graphql(graphqlOperation(listPatients))
    .then((response) => {
      const items = response.data?.listPatients?.items;

      if (items) {
        setPatients(items);
      }
    });
}, []);

  useEffect(() => {
    const subscription = API
      .graphql(graphqlOperation(onCreateMessage))
      .subscribe({
        next: (event) => {
          setMessages([...messages, event.value.data.onCreateMessage]);
        }
      });

    return () => {
      subscription.unsubscribe();
    }
  }, [messages]);

  const handleChange = (event) => {
    setMessageBody(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const input = {
      channelID: '1',
      author: 'Dave',
      body: messageBody.trim()
    };

    try {
      setMessageBody('');
      await API.graphql(graphqlOperation(createMessage, { input }))
    } catch (error) {
      console.warn(error);
    }
  };

  function showProfile(patient) {
    document.getElementById("profileName").innerHTML = patient.fullName;
    document.getElementById("patientName").innerHTML = patient.fullName;
    document.getElementById("profileOperation").innerHTML = patient.operation;
    document.getElementById("profileSurgery").innerHTML = patient.surgeryAt;
    document.getElementById("patientOp").innerHTML = patient.surgeryAt;
    document.getElementById("profileClinic").innerHTML = patient.clinic;
  }

  function sendResponse() {

  }

  return (
  <div className="appInterface">
    <div className="leftMenu">
        {patients.map((patient) => (
          <button onClick={() => showProfile(patient)}
            key={patient.id}
            className='patient'><h2>{patient.fullName}</h2></button>
          ))}
    </div>

    <div className="container">
    <div id="header">
      <h1>WoundCare</h1>
    </div>
    <div id="chatTitle">
      <span>Doctor Dave</span> <span>- </span>
      <span id="patientName">Patient Name</span> <span>-</span> <span>Date of Surgery: </span>
      <span id="patientOp">--/--/--</span>
    </div>
      <div className="messages">
        <div className="messages-scroller">
          {messages.map((message) => (
            <div
              key={message.id}
              className={message.author === 'Dave' ? 'message me' : 'message'}>{message.body}</div>
          ))}
        </div>
      </div>
      <div className="chat-bar">
          <div className="responseOptions">
          <form onSubmit={handleSubmit}>
            <input
              type="submit"
              name="OK_button"
              onClick={handleChange}
              value = "Looks good!"
              id="OK"/>
            <input
              type="submit"
              name="inPerson_button"
              onClick={handleChange}
              value = "I'd like to have a look at it in person."
              id="inPerson"/>
            <input
              type="submit"
              name="checkAgain_button"
              onClick={handleChange}
              value = "Could you please send another picture?"
              id="checkAgain"/>
          </form>
          </div>
          <div className="textBar">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="message"
              placeholder="Type your message here"
              onChange={handleChange}
              value={messageBody}
            />
          </form>
          </div>
      </div>
    </div>

    <div className="rightMenu">
    <div className="profilePicture">
      <img src="https://cdn.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png" alt="profile picture"/>
    </div>
    <div className="profileInfo">
    <div> <p className="profileHeading">Patient name:</p>
    <div id="profileName">
      <p></p>
    </div>
    </div>
    <div> <p className="profileHeading">Operation:</p>
    <div id="profileOperation">
      <p></p>
    </div>
    </div>
    <div> <p className="profileHeading">Date of surgery:</p>
    <div id="profileSurgery">
      <p></p>
    </div>
    </div>
    <div> <p className="profileHeading">Location of operation:</p>
    <div id="profileClinic">
      <p></p>
    </div>
    </div>
    <div> <p className="profileHeading">Notes:</p>
    <div id="profileNotes">
      <p></p>
    </div>
    </div>
    </div>
    </div>
  </div>
  );
}

export default App;
