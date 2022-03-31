import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

import axios from 'axios';
const frm = {
  mondayFrom:
    '<iframe src="https://forms.monday.com/forms/embed/7a9a1c2a763b77897a9df18696c3eba6?r=use1" width="100%" height="2200" style="border: 0; box-shadow: 5px 5px 56px 0px rgba(0,0,0,0.25);"></iframe>'
}
function Iframe(props) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: props.iframe ? props.iframe : "" }}
    />
  );
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      success : false,
      url : "",
      error: false,
      errorMessage : ""
    }
  }

  handleChange = (ev) => {
    this.setState({success: false, url : ""});

  }
  handleUpload = (ev) => {
    let files = this.uploadInput.files;
    console.log(files);
    console.log(files.length);
    for(let i=0; i<files.length; i++){
      let file = this.uploadInput.files[i];
      //onsole.log(file.webkitRelativePath);
      // Split the filename to get the name and type
      let fileParts = this.uploadInput.files[i].name.split('.');
      let fileName = file.webkitRelativePath;
      let fileType = fileParts[1];
      console.log("Preparing the upload");
      axios.post("http://localhost:3001/sign_s3",{
        fileName : fileName,
        fileType : fileType
      })
      .then(response => {
        var returnData = response.data.data.returnData;
        var signedRequest = returnData.signedRequest;
        var url = returnData.url;
        this.setState({url: url})
        console.log("Recieved a signed request " + signedRequest);

        var options = {
          headers: {
            'Content-Type': fileType
          }
        };
        axios.put(signedRequest,file,options)
        .then(result => {
          console.log("Response from s3")
          this.setState({success: true});
        })
        .catch(error => {
          alert("ERROR " + JSON.stringify(error));
        })
      })
      .catch(error => {
        alert(JSON.stringify(error));
      })

    }
  }


  render() {
    const SuccessMessage = () => (
      <div style={{padding:50}}>
        <h3 style={{color: 'green'}}>SUCCESSFUL UPLOAD</h3>
        <a href={this.state.url}>Access the file here</a>
        <br/>
      </div>
    )
    const ErrorMessage = () => (
      <div style={{padding:50}}>
        <h3 style={{color: 'red'}}>FAILED UPLOAD</h3>
        <span style={{color: 'red', backgroundColor: 'black'}}>ERROR: </span>
        <span>{this.state.errorMessage}</span>
        <br/>
      </div>
    )
    return (
      <div className="App">
        <center>
          <h1>UPLOAD A FILE</h1>
          {this.state.success ? <SuccessMessage/> : null}
          {this.state.error ? <ErrorMessage/> : null}
          <input onChange={this.handleChange} ref={(ref) => { this.uploadInput = ref; }}  type="file" multiple directory="" multiple webkitdirectory="" />
          <Button
            className="btn btn-success"
            onClick={this.handleUpload}>UPLOAD</Button>
        </center>
        <h1></h1>
        <Iframe iframe={frm["mondayFrom"]} />,
      </div>
    );
  }
}

export default App;
