import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Backdrop,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import { fetchEndpoint } from './FetchEndpoint';
import CloseIcon from '@mui/icons-material/Close';

const MAX_TAG_LENGTH = 20;

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState<string>(''); // for the input field
  const [tags, setTags] = useState<string[]>([]); // array of tags

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag: string) => {
    if (
      tag &&
      !tags.includes(tag) &&
      tag.length <= MAX_TAG_LENGTH
    ) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const handleTagDelete = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !image) {
      alert('Please provide both title and image.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', image);

    tags.forEach((tag) => formData.append('tag', tag));

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
    setTagInput('');
    setTags([]);
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

            <Box sx={{ mb: 2 }}>
              <TextField
                label="Add Tag"
                fullWidth
                variant="outlined"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                margin="normal"
                inputProps={{ maxLength: MAX_TAG_LENGTH }}
                InputLabelProps={{ style: { color: '#777' } }}
                InputProps={{
                  style: {
                    color: '#333',
                    backgroundColor: '#f9f9f9',
                  },
                }}
                helperText={`Press Enter or comma to add (max ${MAX_TAG_LENGTH} chars)`}
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleTagDelete(tag)}
                    deleteIcon={
                      <IconButton size="small" aria-label="delete">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ backgroundColor: '#e3e3e3', color: '#333' }}
                  />
                ))}
              </Box>
            </Box>

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