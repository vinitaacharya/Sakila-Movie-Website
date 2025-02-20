import React, { useEffect, useState, useRef } from "react"; 
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, Button } from "@mui/material";
import './Modal.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState({
    customer_id: "",
    first_name: "",
    last_name: "",
    email: "",
  });
  

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);

  
  useEffect(() => {
    fetch("http://localhost:5000/customers")
      .then((response) => response.json())
      .then((data) => setCustomers(data))
      .catch((error) => console.error("Error fetching customers:", error));
  }, []);

  
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

  // Modal 
  const Modal = ({ isOpen, onClose, children }) => {
    return (
      <div className={`modal-overlay ${isOpen ? "show" : "hide"}`}>
        <div className="modal-content">
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
          {children}
        </div>
      </div>
    );
  };

  
  const openAddCustomerModal = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      firstNameRef.current?.focus(); //look into it for milestone 3
    }, 0);
  };

  const closeAddCustomerModal = () => {
    setIsModalOpen(false);
    setNewCustomer({
      first_name: "",
      last_name: "",
      email: "",
    }); 
  };
const openEditCustomerModal = (customer) => {
  setCurrentCustomer({ ...customer });
  setIsEditModalOpen(true);
  setTimeout(() => {
    firstNameRef.current.focus(); 
  }, 0);
};


const closeEditCustomerModal = () => {
  setIsEditModalOpen(false);
  setCurrentCustomer({
    customer_id: "",
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
    event.preventDefault();
    
    fetch("http://localhost:5000/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCustomer),
    })
      .then((response) => response.json())
      .then((data) => {
        setCustomers((prevCustomers) => [...prevCustomers, data]);
        closeAddCustomerModal(); 
      })
      .catch((error) => console.error("Error adding customer:", error));
  };

  return (//note meterial -allows to make styled tables easy
    <Paper sx={{ width: "80%", margin: "auto", marginTop: "20px", padding: "20px" }}>
      <button onClick={openAddCustomerModal}>Add Customer</button>
      
      <Modal isOpen={isModalOpen} onClose={closeAddCustomerModal}>
        <h2>Add New Customer</h2>
        <form onSubmit={handleAddCustomer}>
          <TextField
            label="First Name"
            name="first_name"
            value={newCustomer.first_name}
            onChange={handleInput}
            fullWidth
            margin="normal"
            required
            inputRef={firstNameRef}
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={newCustomer.last_name}
            onChange={handleInput}
            fullWidth
            margin="normal"
            required
            inputRef={lastNameRef}
          />
          <TextField
            label="Email"
            name="email"
            value={newCustomer.email}
            onChange={handleInput}
            fullWidth
            margin="normal"
            required
            inputRef={emailRef}
          />
          <Button type="submit" variant="contained" color="primary">
            Add Customer
          </Button>
        </form>
      </Modal>
      <Modal isOpen={isEditModalOpen} onClose={closeEditCustomerModal}>
  <h2>Edit Customer</h2>
  <form onSubmit={handleUpdateCustomer}>
    <TextField
      
      label="First Name"
      name="first_name"
      value={currentCustomer.first_name}
      onChange={handleEditInputChange}
      fullWidth
      margin="normal"
      required
      inputRef={firstNameRef}
/>
    <TextField
      label="Last Name"
      name="last_name"
      value={currentCustomer.last_name}
      onChange={handleEditInputChange}
      fullWidth
      margin="normal"
      required
      inputRef={lastNameRef}
    />
    <TextField
      label="Email"
      name="email"
      value={currentCustomer.email}
      onChange={handleEditInputChange}
      fullWidth
      margin="normal"
      required
      inputRef={emailRef}
    />
    <Button type="submit" variant="contained" color="primary">
      Update Customer
    </Button>
  </form>
</Modal>

      <h1>Customers List</h1>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((customer) => (
                <TableRow key={customer.customer_id}>
                  <TableCell>{customer.customer_id}</TableCell>
                  <TableCell>{customer.first_name}</TableCell>
                  <TableCell>{customer.last_name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>
                  <button onClick={() => handleDeleteCustomer(customer.customer_id)}>
            Delete
          </button>
                    </TableCell>
                    <TableCell>
                    <button onClick={() => openEditCustomerModal(customer)}>Edit</button>                      </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
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


