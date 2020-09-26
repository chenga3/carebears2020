import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import Amplify from '@aws-amplify/core';
import API, { graphqlOperation } from '@aws-amplify/api';
import '@aws-amplify/pubsub';

import { createMessage } from './graphql/mutations';
import { onCreateMessage } from './graphql/subscriptions';
import { listDoctors, listPatients, messagesByChannelId } from './graphql/queries';

import awsExports from './aws-exports';
import './App.css';

Amplify.configure(awsExports);

class PatientForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDischargeOptions: false,
      discharge: '',
      dischargeColour: '',
      dischargeOdour: '',
      increasingPain: '',
      ill: '',
      extraComments: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    var messageBody = 'Discharge - ' + this.state.discharge;
    if (this.state.discharge === "yes") {
      messageBody += '\nDischarge Color - ' + this.state.dischargeColour
                  + '\nDischarge Odour - ' + this.state.dischargeOdour
    }
    messageBody += '\nIncreasing Pain - ' + this.state.increasingPain
                + '\nIll or Fever - ' + this.state.ill
                + '\nExtra comments - ' + this.state.extraComments.trim();

    const input = {
      channelID: '1',
      author: 'Dave',
      body: messageBody
    };

    try {
      await API.graphql(graphqlOperation(createMessage, { input }))
    } catch (error) {
      console.warn(error);
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({[name]: value});
  }

  render() {
    const { showDischargeOptions } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <h1> Patient Form </h1>
        <span>Is there any discharge:</span>
        <input type="radio" id="discharge-yes" name="discharge" value="yes"
          onChange={(event) => {
            this.setState({ showDischargeOptions: true });
            this.handleInputChange(event);
          }}/> Yes
        <input type="radio" id="discharge-no" name="discharge" value="no"
          onChange={(event) => {
            this.setState({ showDischargeOptions: false });
            this.handleInputChange(event);
          }}/> No
        <br/>
        { showDischargeOptions ?
          <div className="discharge-options">
            <span>Discharge colour:</span>
            <input type="radio" name="dischargeColour" value="yellow"
              onChange={this.handleInputChange}/> Yellow
            <input type="radio" name="dischargeColour" value="green"
              onChange={this.handleInputChange}/> Green
            <br/>
            <span>Does discharge have smelly odour:</span>
            <input type="radio" id="discharge-odour" name="dischargeOdour" value="yes"
              onChange={this.handleInputChange}/> Yes
            <input type="radio" id="discharge-odour" name="dischargeOdour" value="no"
              onChange={this.handleInputChange}/> No
            <br/>
          </div> : null
        }
        <span>Is there increasing pain:</span>
        <input type="radio" id="pain" name="increasingPain" value="yes"
          onChange={this.handleInputChange}/> Yes
        <input type="radio" id="pain" name="increasingPain" value="no"
          onChange={this.handleInputChange}/> No
        <br/>
        <span>Do you feel ill or have a fever:</span>
        <input type="radio" id="ill" name="ill" value="yes"
          onChange={this.handleInputChange}/> Yes
        <input type="radio" id="ill" name="ill" value="no"
          onChange={this.handleInputChange}/> No
        <br/>
        <span>Extra comments:</span><br/>
        <textarea name="extraComments"
          onChange={this.handleInputChange}></textarea><br/>
        <input type="submit" value="Submit"/>
      </form>
    );
  }
}

function App() {
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const patient = false;

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

  const uploadImage = async () => {
    var file = document.getElementById("file").files[0];
    if (file) {
      var fullPath = document.getElementById("file").value;
      var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
      var filename = fullPath.substring(startIndex);
      if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
          filename = filename.substring(1);
      }
      const { type: mimeType } = file
      const key = 'images/' + filename;
      const url = 'https://amplify-app90454-dev.s3-ap-southeast-2.amazonaws.com/'+ key;
      const input = { channelID: '1', author: 'Dave', image: url };

      try {
        await Storage.put(key, file, {
          contentType: mimeType
        });
        await API.graphql(graphqlOperation(createMessage, { input }));
      } catch (err) {
        console.log('error: ', err);
      }
    }
  }

  return (
  <div className="appInterface">
  {patient === true ?
    <div className="leftMenu">
    </div>
    :
    <div className="leftMenu">
        {patients.map((patient) => (
          <button onClick={() => showProfile(patient)}
            key={patient.id}
            className='patient'><h2>{patient.fullName}</h2></button>
          ))}
    </div>
}
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
      {patient === true ?
        <div className="submitoptions">
        <Popup trigger={<button> Fill Form </button>} modal nested>
          { close => (
            <div className="modal">
              <button className="close" onClick={close}> &times; </button>
              <PatientForm/>
            </div>
          )}
        </Popup>
        <input type="file" id="file"/>
        <button onClick={uploadImage}>Send Image</button>
      </div>
      :<div>
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
        <div className="chat-bar">
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
        }
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
