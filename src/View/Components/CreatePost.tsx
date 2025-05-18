import React, { useState, ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Backdrop,
  Stack,
} from '@mui/material';
import { fetchEndpoint } from '../FetchEndpoint';

const CreatePost: React.FC = () => {
const [title, setTitle] = useState('');
const [image, setImage] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);

const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
if (file) {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
}
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

if (!title || !image) {
    alert('Please provide both title and image.');
    return;
}

const formData = new FormData();
    formData.append('title', title);
    formData.append('image', image); // name must match backend multer field

    try {
        const token = localStorage.getItem('token');
        const result = await fetchEndpoint('/post/submit', 'POST', token, formData);

        alert('Post created successfully!');
    } catch (error: any) {
        console.error('Upload error:', error);
        alert(`Error: ${error.message}`);
    }
};

const handleCancel = () => {
    setTitle('');
    setImage(null);
    setImagePreview(null);
};

  return (
    <Backdrop
      open
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        color: '#fff',
        backdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
    >
    <Card
        sx={{
            width: 500,
            maxHeight: '90vh',
            overflow: 'auto',
            p: 2,
            borderRadius: 2,
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        >
        <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#333' }}>
            Create a Post
            </Typography>

            <form onSubmit={handleSubmit}>
            <TextField
                label="Post Title"
                fullWidth
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                margin="normal"
                InputLabelProps={{ style: { color: '#777' } }}
                InputProps={{
                style: {
                    color: '#333',
                    backgroundColor: '#f9f9f9',
                },
                }}
            />

            {imagePreview && (
                <Box
                component="img"
                src={imagePreview}
                alt="Preview"
                sx={{
                    width: '100%',
                    borderRadius: 1,
                    mb: 2,
                    border: '1px solid #eee',
                }}
                />
            )}

            <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{
                mb: 2,
                backgroundColor: '#f3f3f3',
                color: '#555',
                fontWeight: 500,
                '&:hover': {
                    backgroundColor: '#e0e0e0',
                },
                }}
            >
                Choose Image
                <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
                />
            </Button>

            <Stack direction="row" spacing={2}>
                <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                    backgroundColor: '#1e88e5',
                    color: '#fff',
                    fontWeight: 600,
                    '&:hover': {
                    backgroundColor: '#1565c0',
                    },
                }}
                >
                Post
                </Button>

                <Button
                variant="outlined"
                fullWidth
                onClick={handleCancel}
                sx={{
                    color: '#555',
                    borderColor: '#ccc',
                    '&:hover': {
                    borderColor: '#aaa',
                    backgroundColor: '#f3f3f3',
                    },
                }}
                >
                Cancel
                </Button>
            </Stack>
            </form>
        </CardContent>
    </Card>
    </Backdrop>
  );
};

export default CreatePost;
