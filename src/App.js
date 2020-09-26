import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import API, { graphqlOperation } from '@aws-amplify/api';
import Amplify, { Storage } from 'aws-amplify';
import '@aws-amplify/pubsub';

import { createMessage } from './graphql/mutations';
import { messagesByChannelId } from './graphql/queries';
import { onCreateMessage } from './graphql/subscriptions';

import './App.css';

Amplify.configure({
  aws_project_region: 'ap-southeast-2',
  Auth: {
    identityPoolId: 'ap-southeast-2:584c9ced-a019-49bc-beaa-78097117b107',
    region: 'ap-southeast-2'
  },
  Storage: {
    AWSS3: {
        bucket: 'aws:s3:::amplify-app90454-dev', //REQUIRED -  Amazon S3 bucket
        region: 'ap-southeast-2', //OPTIONAL -  Amazon service region
    }
  }
});

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
  
  /* REPLACE THIS FUNCTION ONLY */
  render() {
    const { showDischargeOptions } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <h1 className="formheader"> Patient Form </h1>
        <table>
        <tr>
        <td><span>Is there any discharge:</span></td>
        <td><input type="radio" id="discharge-yes" name="discharge" value="yes"
          onChange={(event) => {
            this.setState({ showDischargeOptions: true });
            this.handleInputChange(event);
          }}/> Yes </td>
        <td><input type="radio" id="discharge-no" name="discharge" value="no"
          onChange={(event) => {
            this.setState({ showDischargeOptions: false });
            this.handleInputChange(event);
          }}/> No </td>
        </tr>
        { showDischargeOptions ?
          <div className="discharge-options">
            <table>
            <tr>
            <td><span>Discharge colour:</span></td>
            <td><input type="radio" name="dischargeColour" value="yellow"
              onChange={this.handleInputChange}/> Yellow </td>
            <td><input type="radio" name="dischargeColour" value="green"
              onChange={this.handleInputChange}/> Green </td>
            </tr>
            <tr>
            <td><span>Does discharge have smelly odour:</span></td>
            <td><input type="radio" id="discharge-odour" name="dischargeOdour" value="yes"
              onChange={this.handleInputChange}/> Yes </td>
            <td><input type="radio" id="discharge-odour" name="dischargeOdour" value="no"
              onChange={this.handleInputChange}/> No </td>
            </tr>
            </table>
          </div> : null
        }
        <tr>
        <td><span>Is there increasing pain:</span></td>
        <td><input type="radio" id="pain" name="increasingPain" value="yes"
          onChange={this.handleInputChange}/> Yes </td>
        <td><input type="radio" id="pain" name="increasingPain" value="no"
          onChange={this.handleInputChange}/> No </td>
        </tr>
        <tr>
        <td><span>Do you feel ill or have a fever:</span></td>
        <td><input type="radio" id="ill" name="ill" value="yes"
          onChange={this.handleInputChange}/> Yes</td>
        <td><input type="radio" id="ill" name="ill" value="no"
          onChange={this.handleInputChange}/> No </td>
        </tr>
        </table>
        <span>Extra comments:</span><br/>
        <textarea name="extraComments"
          onChange={this.handleInputChange}></textarea><br/>
        <input type="submit" value="Submit" id="formsubmit"/>
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
    <div className="container">
      <div className="messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.author === 'Dave' ? 'message me' : 'message'}>
            {message.image ? <img src={message.image}></img> : null}
            {message.body}
          </div>
        ))}
      </div>
      <div className="submitoptions">
        <Popup trigger={<button className="submitoption" id="fillform"> Fill Form </button>} modal nested>
          { close => (
            <div className="modal">
              <button className="close" onClick={close}> &times; </button>
              <PatientForm/>
            </div>
          )}
        </Popup>
        <button onClick={uploadImage} className="submitoption" id="sendimage">Send Image</button>
      </div>
    </div>
  );
};

export default App;
