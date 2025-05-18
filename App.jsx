
import { FormControl, InputGroup, Container, Button, Row, Card, } from "react-bootstrap";
import ColorThief from "color-thief-browser";
import { useState, useEffect } from "react";
import './App.css'
const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const [albumCover, setAlbumCover] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [albumColors, setAlbumColors] = useState({});

  useEffect(() => {
  let authParams = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body:
      "grant_type=client_credentials&client_id=" +
      clientId +
      "&client_secret=" +
      clientSecret,
  };

  fetch("https://accounts.spotify.com/api/token", authParams)
    .then((result) => result.json())
    .then((data) => {
      setAccessToken(data.access_token);
    });
}, []);

useEffect(() => {
  // new code for album colors
  {albums.map((album) => (
  <img
    key={album.id}
    src={album.images[0].url}
    crossOrigin="anonymous"
    alt=""
    style={{ display: "none" }}
    onLoad={async (e) => {
      if (!albumColors[album.id]) {
        const color = await ColorThief.getColor(e.target);
        setAlbumColors((prev) => ({
          ...prev,
          [album.id]: `rgb(${color[0]},${color[1]},${color[2]})`,
        }));
      }
    }}
  />
))}
  // eslint-disable-next-line
}, [albums]);

async function search() {
  const artistParams = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
  };

  // Get Artist
  const artistID = await fetch(
    "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
    artistParams
  )
    .then((result) => result.json())
    .then((data) => {
      console.log("Artist ID: ", data.artists.items[0].id);
      return data.artists.items[0].id;
    });

  // Get Albums
    await fetch(
  "https://api.spotify.com/v1/artists/" +
    artistID +
    "/albums?include_groups=album&market=US&limit=50",
  artistParams
)
  .then((result) => result.json())
  .then((data) => {
    setAlbums(data.items);
  });
}
  return(
    <div className="App">
      <h2 style={{ color : "white", textAlign: "center", marginTop: "15px" }}>
        Spotify Album Finder
      </h2>
      <Container>
        <InputGroup>
          <FormControl
            placeholder="Search For Artist"
            type="input"
            aria-label="Search for an Artist"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                search();
              } // search function
            }}
            onChange={(event) => setSearchInput(event.target.value)} // setSearch
            style={{
              width: "300px",
              height: "35px",
              borderWidth: "0px",
              borderStyle: "solid",
              borderRadius: "5px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>
        <Container>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-around",
              alignContent: "center",
            }}
            >
            {albums.map((album) => (
              <Card 
              key={album.id} 
              style={{ 
                width: "250px",
                background: albumColors[album.id]
                ? `linear-gradient(180deg, ${albumColors[album.id]} 0%, #181818 100%)`
                : "white",
                margin: "20px 10px",
                borderRadius: "5px",
                marginBottom: "30px",
                overflow: "hidden",
                }}>
                <Card.Img
                width={200}
                variant="top" 
                src={album.images[0].url}
                style={{
                  borderRadius: "4%",
                }} />
                <Card.Body>
                  <Card.Title
                    style={{
                     display: "flex",
                     justifyContent: "center",
                     alignItems: "center",
                     textAlign: "center",
                     fontWeight: "bold",
                     fontSize: "16px",
                     marginTop: "10px",
                     color: "black",
                     whiteSpace: "normal",
                     overflow: "hidden",}}
                    >
                    {album.name}
                  </Card.Title>
                  <Card.Text
                    style={{
                      color: "black",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  > 
                    {album.release_date} <br /> 
                    {album.release_date}{" "}
                    {album.artists.map((artist) => artist.name).join(", ")}
                    
                  </Card.Text>
                  <Button
                    href={album.external_urls.spotify}
                    style={{
                      backgroundColor: "black",
                      border: "none",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "15px",
                      borderRadius: "5px",
                      padding: "10px",
                      width: "100%",
                    }}
                  >
                    Listen on Spotify
                  </Button>
                </Card.Body>
              </Card>
            ))}
            </Row>
          </Container>
  </div>
  );
}
export default App;

