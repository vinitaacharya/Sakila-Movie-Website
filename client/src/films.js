import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from "@mui/material";

const Films = () => {
  const [films, setFilms] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetch("http://localhost:5000/films")
      .then((response) => response.json())
      .then((data) => setFilms(data))
      .catch((error) => console.error("Error fetching films:", error));
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchFilms = async (searchQuery = "") => {
    try {
      const response = await fetch(`http://localhost:5000/films?search=${searchQuery}`);
      const data = await response.json();
      setFilms(data);
    } catch (error) {
      console.error("Error fetching films:", error);
    }
  };

  return (
    
    <Paper sx={{ width: "80%", margin: "auto", marginTop: "20px", padding: "20px" }}>
        <input
  type="text"
  placeholder="Search films..."
  onChange={(e) => fetchFilms(e.target.value)}
/>
      <h1>Film List</h1>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Category ID</TableCell>
              <TableCell>Category Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {films.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((film) => (
              <TableRow key={film.film_id}>
                <TableCell>{film.film_id}</TableCell>
                <TableCell>{film.title}</TableCell>
                <TableCell>{film.category_id}</TableCell>
                <TableCell>{film.category_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
