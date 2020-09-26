import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import API, { graphqlOperation } from '@aws-amplify/api';
import '@aws-amplify/pubsub';

import { createMessage } from './graphql/mutations';
import { messagesByChannelId } from './graphql/queries';
import { onCreateMessage } from './graphql/subscriptions';

import './App.css';

class PatientForm extends React.Component {
  constructor(props) {
    super(props);
  }  

  state = {showDischargeOptions: false}

  render() {
    const { showDischargeOptions } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <h1> Patient Form </h1>
        <span>Is there any discharge:</span>
        <input type="radio" id="discharge-yes" name="discharge" value="yes"
        onChange={() => this.setState({ showDischargeOptions: true })}/> Yes
        <input type="radio" id="discharge-no" name="discharge" value="no"
        onChange={() => this.setState({ showDischargeOptions: false })}/> No
        <br/>
        { showDischargeOptions ?
          <div className="discharge-options">
            <span>Discharge colour:</span>
            <input type="radio" id="discharge-colour" name="discharge-colour" value="Yellow"/> Yes
            <input type="radio" id="discharge-colour" name="discharge-colour" value="Green"/> No
            <br/>
            <span>Does discharge have smelly odour:</span>
            <input type="radio" id="discharge-colour" name="discharge-colour" value="Yellow"/> Yes
            <input type="radio" id="discharge-colour" name="discharge-colour" value="Green"/> No
            <br/>
          </div> : null
        }
        <span>Is there increasing pain:</span>
        <input type="radio" id="pain" name="pain" value="yes"/> Yes
        <input type="radio" id="pain" name="pain" value="no"/> No
        <br/>
        <span>Do you feel ill or have a fever:</span>
        <input type="radio" id="ill" name="ill" value="yes"/> Yes
        <input type="radio" id="ill" name="ill" value="no"/> No
        <br/>
        <span>Extra comments:</span><br/>
        <textarea></textarea><br/>
        <input type="submit" value="Submit"/>
      </form>
    );
  }
}

function App() {

  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');

  useEffect(() => {
    API
      .graphql(graphqlOperation(messagesByChannelId, {
        channelID: '1',
        sortDirection: 'ASC'
      }))
      .then((response) => {
        const items = response.data?.messagesByChannelID?.items;
        
        if (items) {
          setMessages(items);
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
    };
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

  
  
  return (
    <div className="container">
      <div className="messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.author === 'Dave' ? 'message me' : 'message'}>{message.body}</div>
        ))}
      </div>
      {/* <div className="chat-bar">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="message"
            placeholder="Type your message here"
            onChange={handleChange}
            value={messageBody}
          />
        </form>
      </div> */}
      <div className="submitoptions">
        <button> Upload Photo </button>
        <Popup trigger={<button> Fill Form </button>} modal nested>
          { close => (
            <div className="modal">
              <button className="close" onClick={close}> &times; </button>
              <PatientForm/>
            </div>
          )}
        </Popup>
      </div>
    </div>
  );
};

export default App;
