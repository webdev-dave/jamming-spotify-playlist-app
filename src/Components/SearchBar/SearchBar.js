import React from 'react';

import './SearchBar.css';


class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            term: ''
        }

        this.search = this.search.bind(this);
        this.handleTermChange = this.handleTermChange.bind(this);
    }

    handleEnterKey(event){
        if (event.keyCode === 13) {
            this.search();
        }
    }

    search() {
        this.props.onSearch(this.state.term);
    }

    handleTermChange(e) {
        this.setState({ term: e.target.value });
    }

    render () {
        return(
            <div className="SearchBar">
              <h2>Welcome {this.props.userName}</h2>
              <input onChange={this.handleTermChange} placeholder="Enter A Song, Album, or Artist" onKeyDown={(e) => this.handleEnterKey(e)}  />
              <button onClick={this.search} className="SearchButton">SEARCH</button>
            </div>
        )
    }
}

export default SearchBar;
