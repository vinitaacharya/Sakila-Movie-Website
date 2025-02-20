import React, { useEffect, useState } from "react";

const ActorModal = ({ actor, films, closeActorModal }) => {
   return (
     <>
       <div 
         style={{
           position: 'fixed',
           top: 0,
           left: 0,
           width: '100%',
           height: '100%',
           backgroundColor: 'rgba(59, 34, 34, 0.5)',
           zIndex: 999
         }} 
         onClick={closeActorModal}
       ></div>
 
       
       <div style={{ 
         display: 'block', 
         position: 'fixed', 
         top: '50%', 
         left: '50%', 
         transform: 'translate(-50%, -50%)',
         backgroundColor: "black",
         padding: '20px', 
         borderRadius: '8px', 
         boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', 
         
       }}>
         <h2>{actor.first_name} {actor.last_name}</h2>
         <h3>Top 5 Rented Films</h3>
         <table>
           <thead>
             <tr>

               <th>Film Title</th>
               <th>Times Rented</th>
             </tr>
           </thead>
           <tbody>
             {films.map((film) => (
               <tr key={film.film_id}>
                 <td>{film.title}</td>
                 <td>{film.rented}</td>
               </tr>
             ))}
           </tbody>
         </table>
         <button onClick={closeActorModal}>Close</button>
       </div>
     </>
   );
 };
 

const Home = () => {

   const [topFilms, setTopFilms] = useState([]);

   const [topActors, setTopActors] = useState([]);
   const [actorFilms, setActorFilms] = useState([]);
   const [selectedActor, setSelectedActor] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
 
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
    setIsModalOpen(true); 
  })
 .catch((error) => console.error("Error fetching actor films:", error));

   };
 
   const closeActorModal = () => {
     setIsModalOpen(false);
   };
 
   const selectedActorData = topActors.find(a => a.actor_id === selectedActor);
 
   return (
     <div>
       <h1>Top 5 Most Rented Films</h1>
       <table>
         <thead>
           <tr>
             <th></th>
          <th>Film Title</th>
             {/* <th>Category</th> */}
             {/* <th>Times Rented</th> */}
           </tr>
         </thead>
         <tbody>
           {topFilms.map((film, num) => (
             <tr key={film.film_id}>
               <td>{num + 1}</td>
               <td>{film.title}</td>
               {/* <td>{film.category}</td> */}
               {/* <td>{film.rented}</td> */}
             </tr>
           ))}</tbody>
       </table>
 
       <h1>Top 5 Actors in Store Films</h1>
       <table>
         <thead>
           <tr>
             <th></th>
             <th>Actor Name</th>
             {/* <th>Films Available</th> */}
       </tr>
         </thead>
         <tbody>
           {topActors.map((actor, num) => (
                <tr key={actor.actor_id} onClick={() => handleActorClick(actor.actor_id)}>
               <td>{num + 1}</td>
               <td>{actor.first_name} {actor.last_name}</td>
               {/* <td>{actor.film_count}</td> */}
             </tr>
           ))}
         </tbody>
       </table>
 
   {isModalOpen && selectedActorData && (
         <ActorModal actor={selectedActorData} films={actorFilms} closeActorModal={closeActorModal} />
       )}
     </div>



   );
 };

 
 export default Home;
 