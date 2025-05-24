import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import FAIcon from './FAIcon';

interface NoContentPlaceholderProps {
  icon: string;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

const NoContentPlaceholder: React.FC<NoContentPlaceholderProps> = ({
  icon,
  title,
  message,
  actionText,
  onAction
}) => {
  return (
    <Paper
      sx={{
        p: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        backgroundColor: '#1a1a1a',
        color: 'white',
      }}
    >
      <Box
        sx={{
          width: 70,
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          mb: 3,
        }}
      >
        <FAIcon icon={icon} style={{ fontSize: 32, color: '#aaa' }} />
      </Box>
      <Typography variant="h5" fontWeight={500} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="#aaa" sx={{ mb: 3 }}>
        {message}
      </Typography>
      {actionText && onAction && (
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          startIcon={<FAIcon icon="fas fa-arrow-right" />}
        >
          {actionText}
        </Button>
      )}
    </Paper>
  );
};

export default NoContentPlaceholder;