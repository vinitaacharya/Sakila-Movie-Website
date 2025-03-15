import React, { useState, useEffect, useRef } from "react"; 
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, Button, 
         MenuItem, FormControl, InputLabel, Select, Box, Typography, Modal } from "@mui/material";
import './Modal.css';



const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentCustomer, setCurrentCustomer] = useState({
    customer_id: "",
    first_name: "",
    last_name: "",
    email: "",
  });
 


  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
 
  //search + filter
  const [searchFilter, setSearchFilter] = useState("first_name"); // Default to filtering by first name
  const[searchQuery, setSearchQuery] = useState("");


  const handleSearchChange = (event)=>{
    setSearchQuery(event.target.value);
  }
  const handleFilterChange = (event) => {
    setSearchFilter(event.target.value);
  };




  //get customers from database
  useEffect(() => {
    fetch("http://localhost:5000/customers")
      .then((response) => response.json())
      .then((data) => setCustomers(data))
      .catch((error) => console.error("Error fetching customers:", error));
  }, []);

//return rental
const handleReturnBook = (rentalId) => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  fetch(`http://localhost:5000/return/${rentalId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ return_date: today }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to return book");
      }
      return response.json();
    })
    .then(() => {
      // Re-fetch the rental history after updating the return date
      fetch(`http://localhost:5000/rentals/${selectedCustomer.customer_id}`)
        .then((response) => response.json())
        .then((data) => {
          setRentalHistory(data);
        })
        .catch((error) => console.error("Error fetching rental history:", error));
    })
    .catch((error) => console.error("Error returning book:", error));
};


  



  const filteredCustomers = customers.filter((customer) => {
    if(!searchQuery) return true;


    const valueToFilter = customer[searchFilter]?.toString().toLowerCase() || "";
    console.log("value to filter",valueToFilter);
    return valueToFilter.includes(searchQuery.toLowerCase());
   
  });
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
//Delete
const handleDeleteCustomer = (customerId) => {
  if (!window.confirm("Are you sure you want to delete this customer?")) return;


  fetch(`http://localhost:5000/customers/${customerId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("delete customers not working :(");
      }
      return response.json();
    })
    .then(() => {
     
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer.customer_id !== customerId)
      );
    })
    .catch((error) => console.error("didntt workkk", error));
};
 
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  // edit Modal
const [openEdit, setOpenEdit] = useState(false);
const openEditCustomerModal = (customer) => {
  setCurrentCustomer({ ...customer });
  setOpenEdit(true);
  //setTimeout(() => {
  //  firstNameRef.current.focus();
 // }, 0);
};
const closeEditCustomerModal = () => {
  setOpenEdit(false);
  setCurrentCustomer({
    customer_id: "",
    first_name: "",
    last_name: "",
    email: "",
  });
};



//customer details modal
const [openDetails, setOpenDetails] = useState(false);
const [selectedCustomer, setSelectedCustomer] = useState(null);
const [rentalHistory, setRentalHistory] = useState([]);
const [rentalPage, setRentalPage] = useState(0);
const [rentalRowsPerPage, setRentalRowsPerPage] = useState(5);

const openCustomerDetailsModal = (customer) => {
  setSelectedCustomer(customer);
  setOpenDetails(true);

  // Fetch rental history for the selected customer
  fetch(`http://localhost:5000/rentals/${customer.customer_id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Rental History:", data);  // Check the structure of the response

      setRentalHistory(data);
    })
    .catch((error) => console.error("Error fetching rental history:", error));
};

const closeCustomerDetailModal = () => {
  setOpenDetails(false);
  setSelectedCustomer(null);
};

//rental page pagniation:
const handleRentalPageChange = (event, newPage) => {
  setRentalPage(newPage);
};
const handleRentalRowsPerPageChange = (event) => {
  setRentalRowsPerPage(parseInt(event.target.value, 10));
  setRentalPage(0); // Reset to page 0 when rows per page is changed
};

//add customer modal
const [openAdd, setOpenAdd] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
const openAddCustomerModal = (customer) => {
  //setSelectedCustomer(customer);
  setOpenAdd(true);
};

const closeAddCustomerModal = () => {
  setOpenAdd(false);
  setNewCustomer({
    first_name: "",
    last_name: "",
    email: "",
  });
};
const handleEditInputChange = (event) => {
  const { name, value } = event.target;
  setCurrentCustomer((prev) => ({
    ...prev,
    [name]: value,
  }));
};


const handleUpdateCustomer = (event) => {
  event.preventDefault();


  fetch(`http://localhost:5000/customers/${currentCustomer.customer_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(currentCustomer),
  })
    .then((response) => response.json())
    .then((updatedCustomer) => {
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.customer_id === updatedCustomer.customer_id ? updatedCustomer : customer
        )
      );
      closeEditCustomerModal();
    })
    .catch((error) => console.error("Error updating customer:", error));
};


  const handleInput = (event) => {
    const { name, value } = event.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleAddCustomer = (event) => {
    event.preventDefault(); // Prevents page reload
  
    fetch("http://localhost:5000/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCustomer),
    })
      .then((response) => response.json())
      .then((data) => {
        setCustomers((prevCustomers) => [...prevCustomers, data]); // Update the customers list
        closeAddCustomerModal();
      })
      .catch((error) => console.error("Error adding customer:", error));
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
  const styleRental = {
    position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%", // Adjust width to be a percentage
  maxWidth: 600, // Set a max width to prevent it from being too wide
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,

  };

  return (
    <Paper sx={{ width: "80%", margin: "auto", marginTop: "20px", padding: "20px" }}>

      {/* Add Customer Button */}
      <Button sx={{ mt: 2, bgcolor: "black", color: "white" }} variant="contained" onClick={ openAddCustomerModal}>Add Customer</Button>
      <Modal open={openAdd} onClose={closeAddCustomerModal}>
      <Box sx={{ ...style, color: 'black' }}>
      <Typography variant="h6">Add Customer</Typography>
          <form onSubmit={handleAddCustomer}>
  <TextField 
    label="First Name" 
    name="first_name" 
    value={newCustomer.first_name}
    onChange={handleInput}
    fullWidth 
    margin="normal" 
    required 
  />
  <TextField 
    label="Last Name" 
    name="last_name" 
    value={newCustomer.last_name}
    onChange={handleInput}
    fullWidth 
    margin="normal" 
    required 
  />
  <TextField 
    label="Email" 
    name="email" 
    value={newCustomer.email}
    onChange={handleInput}
    fullWidth 
    margin="normal" 
    required 
  />
  <Button type="submit" variant="contained">Add Customer</Button>
  <Button onClick={closeAddCustomerModal}>Close</Button>
</form>
        </Box>
      </Modal>


      {/* Customer Details Modal */}
      <Modal open={openDetails} onClose={closeCustomerDetailModal}>
      <Box sx={{ ...styleRental, color: 'black' }}>
      <Typography variant="h3" sx={{ color: "rgb(133, 1, 1)" }}>
  Customer Details
</Typography>    {selectedCustomer && (
      <>
        <Typography><strong>ID:</strong> {selectedCustomer.customer_id}</Typography>
        <Typography><strong>First Name:</strong> {selectedCustomer.first_name}</Typography>
        <Typography><strong>Last Name:</strong> {selectedCustomer.last_name}</Typography>
        <Typography><strong>Email:</strong> {selectedCustomer.email}</Typography>
      </>
    )}

    {/* Rental History Table with Pagination */}
    <Typography variant="h6" sx={{ mt: 2 }}>Rental History</Typography>
    <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: "0.85rem", padding: "6px 10px" }}>Rental ID</TableCell>
            <TableCell sx={{ fontSize: "0.85rem", padding: "6px 10px" }}>Movie Title</TableCell>
            <TableCell sx={{ fontSize: "0.85rem", padding: "6px 10px" }}>Rental Date</TableCell>
            <TableCell sx={{ fontSize: "0.85rem", padding: "6px 10px" }}>Return Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rentalHistory.length > 0 ? (
            rentalHistory.slice(rentalPage * rentalRowsPerPage, rentalPage * rentalRowsPerPage + rentalRowsPerPage)
              .map((rental) => (
                <TableRow key={rental.rental_id}>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "6px 10px" }}>{rental.rental_id}</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "6px 10px" }}>
  {rental.title}
</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "6px 10px" }}>{rental.rental_date}</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "6px 10px" }}>{rental.return_date ? rental.return_date : "Not Returned"}</TableCell>
                  {/* Return Button */}
              <TableCell>
                <Button
                  onClick={() => handleReturnBook(rental.rental_id)}
                  variant="contained"
                  sx={{ bgcolor: "black", color: "white", fontSize: "0.8rem", padding: "4px 8px" }}
                  disabled={rental.return_date !== null} // Disable button if already returned
                >
                  {rental.return_date ? "Returned" : "Return"}
                </Button>
              </TableCell>
                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">No rentals found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>

    {/* Pagination Controls */}
    <TablePagination
      component="div"
      count={rentalHistory.length}
      page={rentalPage}
      rowsPerPage={rentalRowsPerPage}
      onPageChange={handleRentalPageChange}
      onRowsPerPageChange={handleRentalRowsPerPageChange}
    />
   

<Button
  onClick={closeCustomerDetailModal}
  variant="contained"
  sx={{ mt: 2, bgcolor: "black", color: "white" }}
>
  Close
</Button>  </Box>
</Modal>

      {/* Customer Edit Modal */}
      <Modal open={openEdit} onClose={closeEditCustomerModal}>
        <Box sx={style}>
        <Typography variant="h6" sx={{ color: "rgb(133, 1, 1)" }}>Edit Customer Details</Typography>
          <form onSubmit={handleUpdateCustomer}>
            <TextField
              label="First Name"
              name="first_name"
              value={currentCustomer.first_name}
              onChange={handleEditInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Last Name"
              name="last_name"
              value={currentCustomer.last_name}
              onChange={handleEditInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              name="email"
              value={currentCustomer.email}
              onChange={handleEditInputChange}
              fullWidth
              margin="normal"
              required
            />
            <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: "black", color: "white" }}>Update Customer</Button>
            <Button onClick={closeEditCustomerModal} sx={{ color: "black" }}>Close</Button>
          </form>
        </Box>
      </Modal>

      {/* Customers List */}
      <h1>Customers List</h1>
<div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
  {/* Search Input */}
  <TextField
    label="Search"
    variant="outlined"
    fullWidth
    value={searchQuery}
    onChange={handleSearchChange}
  />


  {/* Dropdown to Select Search Filter */}
  <FormControl style={{ minWidth: 150 }}>
    <InputLabel>Filter By</InputLabel>
    <Select value={searchFilter} onChange={handleFilterChange}>
      <MenuItem value="customer_id">Customer ID</MenuItem>
      <MenuItem value="first_name">First Name</MenuItem>
      <MenuItem value="last_name">Last Name</MenuItem>
    </Select>
  </FormControl>
</div>


      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Delete</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((customer) => (
              <TableRow key={customer.customer_id}>
                <TableCell>{customer.customer_id}</TableCell>
                <TableCell>{customer.first_name}</TableCell>
                <TableCell>{customer.last_name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell><Button onClick={() => handleDeleteCustomer(customer.customer_id)} sx={{ color: "rgb(133, 1, 1)" }}>Delete</Button></TableCell>
                <TableCell><Button onClick={() => openEditCustomerModal(customer)} sx={{ color: "rgb(133, 1, 1)" }}>Edit</Button></TableCell>
                <TableCell><Button onClick={() => openCustomerDetailsModal(customer)} sx={{ color: "rgb(133, 1, 1)" }}>Details</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={customers.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default Customers;



