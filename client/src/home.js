import React, { useEffect, useState } from "react";
import { Card, CardContent, CardActionArea, Typography, Grid, Modal, Box } from "@mui/material";

const ActorModal = ({ actor, films, closeActorModal }) => {
  return (
    <Modal open={true} onClose={closeActorModal}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
          maxWidth: 400,
          color: "black",
        }}
      >
        <Typography variant="h5" gutterBottom>
          {actor.first_name} {actor.last_name}
        </Typography>
        <Typography variant="h6"><strong>Top 5 Actors</strong></Typography>
        {films.map((film) => (
          <Typography key={film.film_id} variant="body1">
             <strong>{film.rented} rents</strong>: {film.title}:
          </Typography>
        ))}
      </Box>
    </Modal>
  );
};

const FilmModal = ({ film, closeFilmModal }) => {
  if (!film) return null; // Prevent rendering if no film is selected

  return (
    <Modal open={true} onClose={closeFilmModal}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
          maxWidth: 400,
          color: "black",
        }}
      >
        <Typography variant="h5" gutterBottom>
          {film.title}
        </Typography>
        <Typography variant="body1">Category: {film.category}</Typography>
        <Typography variant="body1">Rating: {film.rating}</Typography>
        <Typography variant="body1">Release Year: {film.release_year}</Typography>
        <Typography variant="body1">Rental Count: {film.rented}</Typography>
        <Typography variant="body1">Description: {film.description}</Typography>
      </Box>
    </Modal>
  );
};

const Home = () => {
  const [topFilms, setTopFilms] = useState([]);
  const [topActors, setTopActors] = useState([]);
  const [actorFilms, setActorFilms] = useState([]);
  const [selectedActor, setSelectedActor] = useState(null);
  const [isActorModalOpen, setIsActorModalOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [isFilmModalOpen, setIsFilmModalOpen] = useState(false);
  


  useEffect(() => {
    fetch("http://localhost:5000/top-films")
      .then((response) => response.json())
      .then((data) => setTopFilms(data))
      .catch((error) => console.error("Error fetching top films:", error));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/top-actors")
      .then((response) => response.json())
      .then((data) => setTopActors(data))
      .catch((error) => console.error("Error fetching top actors:", error));
  }, []);

  const handleActorClick = (actorId) => {
    setSelectedActor(actorId);
    fetch(`http://localhost:5000/actor-films/${actorId}`)
      .then((response) => response.json())
      .then((data) => {
        setActorFilms(data);
        setIsActorModalOpen(true);
      })
      .catch((error) => console.error("Error fetching actor films:", error));
  };

  const handleFilmClick = (filmId) => {
    const film = topFilms.find((f) => f.film_id === filmId);
    if (film) {
      setSelectedFilm(film);
      setIsFilmModalOpen(true);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
        Top 5 Most Rented Films
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {topFilms.map((film, num) => (
          <Grid item key={film.film_id}>
            <Card 
              sx={{
                width: 200,
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                cursor: "pointer",
                 bgcolor: "black", color: "white",
              }}
            >
              <CardActionArea onClick={() => handleFilmClick(film.film_id)}>
                <CardContent>
                  <Typography variant="h6">{num + 1}. {film.title}</Typography>
                  <Typography variant="h6">Rental Count: {film.rented}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h4" gutterBottom style={{ marginTop: "30px", textAlign: "center" }}>
        Top 5 Actors in Store Films
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {topActors.map((actor, num) => (
          <Grid item key={actor.actor_id}>
            <Card
              sx={{
                width: 200,
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                cursor: "pointer",
                bgcolor: "black", color: "white",
              }}
            >
              <CardActionArea onClick={() => handleActorClick(actor.actor_id)}>
                <CardContent>
                  <Typography variant="h6">
                    {num + 1}. {actor.first_name} {actor.last_name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {isActorModalOpen && selectedActor && (
        <ActorModal actor={topActors.find((a) => a.actor_id === selectedActor)} films={actorFilms} closeActorModal={() => setIsActorModalOpen(false)} />
      )}

      {isFilmModalOpen && selectedFilm && (
        <FilmModal film={selectedFilm} closeFilmModal={() => setIsFilmModalOpen(false)} />
      )}
    </div>
  );
};

export default Home;

