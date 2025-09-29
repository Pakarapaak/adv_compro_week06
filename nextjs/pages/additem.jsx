import { useState, useEffect } from "react";
import {
  Container,
  Button,
  Typography,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import useBearStore from "@/store/useBearStore";

export default function AddItemPage() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    image: null,
  });
  const [editId, setEditId] = useState(null);

  const user = useBearStore((state) => state.user);
  const API_URL = "http://localhost:8000/api/items/";

  // Fetch user items
  const fetchItems = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}user/${user.username}`);
      if (!res.ok) throw new Error("Failed to fetch items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const handleOpen = (item) => {
    if (item) {
      setForm({
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        image: null,
      });
      setEditId(item.id);
    } else {
      setForm({ name: "", description: "", price: "", quantity: "", image: null });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ name: "", description: "", price: "", quantity: "", image: null });
    setEditId(null);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setForm({ ...form, image: e.target.files[0] });

  // Save item (add or update)
  const handleSubmit = async () => {
    if (!user) {
      Swal.fire("Error", "You must be logged in", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", parseFloat(form.price));
      formData.append("quantity", parseInt(form.quantity));
      formData.append("username", user.username); // send username as part of FormData
      if (form.image) formData.append("image", form.image);

      const url = editId ? `${API_URL}${editId}` : `${API_URL}add/`;

      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to save item");
      }

      await fetchItems();
      Swal.fire("Success!", "Item saved.", "success");
      handleClose();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Delete item
  const handleDelete = async (item) => {
    if (!user || item.username !== user.username) {
      Swal.fire("Error", "You can only delete your own items.", "error");
      return;
    }

    try {
      const url = `${API_URL}${item.id}?username=${user.username}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      await fetchItems();
      Swal.fire("Deleted!", "Item deleted.", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "price", headerName: "Price", width: 120 },
    { field: "quantity", headerName: "Quantity", width: 120 },
    {
      field: "image",
      headerName: "Photo",
      width: 150,
      renderCell: (params) =>
        params.value ? (
          <img
            src={`http://localhost:8000/static/images/${params.value}`}
            alt="item"
            width={50}
          />
        ) : (
          "No Image"
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => handleOpen(params.row)}>
            Edit
          </Button>
          <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(params.row)}>
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        My Items
      </Typography>

      <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Add Item
      </Button>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid rows={items} columns={columns} getRowId={(row) => row.id} pageSize={5} />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? "Edit Item" : "Add Item"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} required />
            <TextField label="Description" name="description" value={form.description} onChange={handleChange} required />
            <TextField label="Price" name="price" type="number" value={form.price} onChange={handleChange} required />
            <TextField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
