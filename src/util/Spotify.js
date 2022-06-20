// import SearchBar from "../Components/SearchBar/SearchBar";

let accessToken;
const clientID = "ec2cedbc9d7e47e2a7f511b3a00e56c5";
const redirectURI = "http://localhost:3000";

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    //check for access token match
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);

      //this clears the parameters, allowing us to grab a new access token
      window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
      window.history.pushState("Access Token", null, "/");
      return accessToken;

    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
      window.location = accessUrl;
    }

  },

  getUserProfile () {
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    return fetch("https://api.spotify.com/v1/me", { headers: headers })
      .then((response) => {
        return response.json();
      })
      .then((jsonResponse) => {
        return {
          userName: jsonResponse.display_name,
          followers: jsonResponse.followers.total
        };
      });
  },

  getUserPlaylists() {
    let offset = 0;
    let url = `https://api.spotify.com/v1/users/31gtj7itdikvmsq3jchigvcvn6my/playlists?offset=${offset}&limit=20`;
    let totalPlaylistSum;
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let allUsersPlaylistsArr = [];


    const fetchPlaylists = async (urlParam) => {
      const request = await fetch(urlParam, {
        headers: headers,
      })
      const jsonResponse = await request.json();
      const currentPlaylistBatchArr = await jsonResponse.items.map((playlist) => ({
          name: playlist.name.toLowerCase(),
          id: playlist.id,
          uri: playlist.uri      
        })
      );
      totalPlaylistSum = await jsonResponse.total;
      return await currentPlaylistBatchArr;

    };


    const awaitFetchLoop = async () => {
      //1st call gets total sum
      await fetchPlaylists(url);
      //loops over fetch request for X amount of times where X = totalSum/20 (because every fetch returns a batch of 20);  
      for(let i = totalPlaylistSum; i > 0 ; i -= 20){
          await fetchPlaylists(`https://api.spotify.com/v1/users/31gtj7itdikvmsq3jchigvcvn6my/playlists?offset=${offset}&limit=20`).then((returnedArr)=>{
          allUsersPlaylistsArr.push(...returnedArr);
          })
          offset += 20;
          //console.log(allUsersPlaylistsArr)  
        }
        return allUsersPlaylistsArr
    }


    return awaitFetchLoop();
  },

  getTopChartTracks() {
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const topGlobal = "37i9dQZEVXbNG2KDcFcKOF";

    return fetch(`https://api.spotify.com/v1/playlists/${topGlobal}`, {
      headers: headers,
    })
      .then((response) => response.json())
      .then((jsonResponse) => {
        const infoArr = jsonResponse.tracks.items.map((track) => ({
          id: track.track.id,
          name: track.track.name,
          artist: track.track.artists[0].name,
          album: track.track.album.name,
          uri: track.track.uri,
        }));
        return infoArr;
      });
  },

  search(term) {
    const accessToken = Spotify.getAccessToken();

    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => {
        return response.json();
      })
      .then((jsonResponse) => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri,
        }));
      });
  },

  savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;

    return fetch("https://api.spotify.com/v1/me", { headers: headers })
      .then((response) => response.json())
      .then((jsonResponse) => {
        userId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          headers: headers,
          method: "POST",
          body: JSON.stringify({ name: name }),
        })
          .then((response) => response.json())
          .then((jsonResponse) => {
            const playlistId = jsonResponse.id;
            return fetch(
              `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
              {
                headers: headers,
                method: "POST",
                body: JSON.stringify({ uris: trackUris }),
              }
            );
          });
      });
  },
};

export default Spotify;
