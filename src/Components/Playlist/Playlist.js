import React from "react";
import TrackList from "../TrackList/TrackList";

import "./Playlist.css";

class Playlist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resetInput: false,
      mostRecentValue: "",
      notifyAlreadyTaken: false,
      deactivateButton: true,
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    // this.updatePlaylistName = this.updatePlaylistName.bind(this);
  }

  handleNameChange(e) {
    let value = e.target.value;

    if (value && this.isPlaylistNameTaken(value.trim())) {
      this.setState({
        notifyAlreadyTaken: true,
        deactivateButton: true,
      });
    } else if (!value) {
      this.setState({
        deactivateButton: true,
      });
    } else {
      this.setState({
        notifyAlreadyTaken: false,
        deactivateButton: false,
      });
      this.props.onNameChange(value);
    }

    this.setState({ mostRecentValue: value });
  }

  handleSubmit() {
    if (!this.state.deactivateButton) {
      this.props.onSave(this.state.mostRecentValue);
      this.setState({
        resetInput: true,
        mostRecentValue: "",
      });

      this.setState({ resetInput: false });
    }
  }

  isPlaylistNameTaken = (name) => {
    const nameToLowerCase = name.toLowerCase();
    //console.log(nameToLowerCase);
    return this.props.playlists.some(
      (playlist) => playlist.name === nameToLowerCase
    );
  };

  render() {
    return (
      <div className="Playlist">
        <input
          placeholder={"Choose Playlist Name"}
          value={this.state.resetInput ? "" : this.state.mostRecentValue}
          onChange={this.handleNameChange}
        />

        {this.state.notifyAlreadyTaken && (
          <p className="errorBox">name already in use</p>
        )}
        <TrackList
          tracks={this.props.playlistTracks}
          onRemove={this.props.onRemove}
          isRemoval={true}
        />
        <button
          className={
            !this.state.deactivateButton
              ? "Playlist-save"
              : "deactivate-Playlist-save"
          }
          onClick={this.handleSubmit}
        >
          SAVE TO SPOTIFY
        </button>
      </div>
    );
  }
}

export default Playlist;
