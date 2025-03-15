import React, { useEffect, useState } from "react"; 
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, 
         TextField, FormControl, InputLabel, Select, MenuItem, 
         Button,
         Modal, Box} from "@mui/material";
import './Modal.css';

const Films = () => {
  const [films, setFilms] = useState([]);  // Store films data
  const [page, setPage] = useState(0);  
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");  
  const [searchFilter, setSearchFilter] = useState("title"); // Default: Search by Film Name

  // Fetch films when component loads or when searchQuery or searchFilter changes
  useEffect(() => {
    fetchFilms();
  }, [searchQuery, searchFilter]);

  const fetchFilms = async () => {
    try {
      const response = await fetch(`http://localhost:5000/films?search=${searchQuery}&filter=${searchFilter}`);
      const data = await response.json();
      setFilms(data);
    } catch (error) {
      console.error("Error fetching films:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (event) => {
    setSearchFilter(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  //add films details modal
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [customerId, setCustomerId] = useState(""); // To store customer ID for rental

  const openDetailsModal = (film) => {
    setSelectedFilm(film);  // Set the selected film
    setOpenDetails(true);  // Open the modal
  };

  const closeDetailsModal = () => {
    setOpenDetails(false);  // Close the modal
    setSelectedFilm(null);  // Reset selected film
  };
  
  const handleRentFilm = async () => {
    if (selectedFilm && customerId) {
      try {
        const response = await fetch(`http://localhost:5000/rent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            film_id: selectedFilm.film_id,
            customer_id: customerId
          })

        });

        if (response.ok) {
          alert('Rental successful!');
          setCustomerId('');  // Clear the input field
          closeDetailsModal(); // Close the modal after renting
        } else {
          alert('Failed to rent the film');
        }
      } catch (error) {
        console.error("Error renting film:", error);
        alert('Error renting film');
      }
    } else {
      alert('Please select a customer and a film');
    }
  };
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };
  return (
    <Paper sx={{ width: "80%", margin: "auto", marginTop: "20px", padding: "20px" }}>
      
      {/* Film Details Modal */}
      <Modal open={openDetails} onClose={closeDetailsModal}>
        <Box sx={{ ...style, color: 'black' }}>
          {selectedFilm ? (
            <>
              <h2>Film Details</h2>
              <p><strong>Title:</strong> {selectedFilm.title}</p>
              <p><strong>Category:</strong> {selectedFilm.category}</p>
              <p><strong>Description:</strong> {selectedFilm.description}</p>
              <p><strong>Actors:</strong> {selectedFilm.actors}</p>

              {/* Add more fields as needed */}
            </>
          ) : (
            <p>Loading...</p>
          )}
          <h2>Rent Film: {selectedFilm?.title}</h2>
                    {/* Display available and total copies */}
                    <div style={{ marginBottom: "20px" }}>
          </div>

          {/* Customer ID Input */}
          <TextField
            label="Customer ID"
            variant="outlined"
            fullWidth
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleRentFilm}>
            Rent
          </Button>
        </Box>
      </Modal>
      <h1>Film List</h1>

      {/* Search Section */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {/* Dropdown to Select Search Filter */}
        <FormControl style={{ minWidth: 150 }}>
          <InputLabel>Search By</InputLabel>
          <Select value={searchFilter} onChange={handleFilterChange}>
            <MenuItem value="title">Film Name</MenuItem>
            <MenuItem value="actor">Actor Name</MenuItem>
            <MenuItem value="category">Genre</MenuItem>
          </Select>
        </FormControl>

        {/* Search Input */}
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Film List Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Details</TableCell>
              {/* <TableCell>Actors</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {films.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((film) => (
              <TableRow key={film.film_id}>
                <TableCell>{film.film_id}</TableCell>
                <TableCell>{film.title}</TableCell>
                <TableCell>{film.category}</TableCell>
                {/* <TableCell>{film.actors}</TableCell> */}
                <TableCell><Button onClick={() => openDetailsModal(film)}>Details</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={films.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default Films;
