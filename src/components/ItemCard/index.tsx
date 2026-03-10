import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import type { Item } from '../../types';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

/**
 * 物品卡片组件
 * @param item 物品数据
 * @param onClick 点击回调函数
 */
export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  return (
    <Card 
      sx={{ 
        borderRadius: 2, 
        boxShadow: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease'
        }
      }}
      onClick={onClick}
    >
      {item.main_photo && (
        <CardMedia
          component="img"
          height="140"
          image={item.main_photo}
          alt={item.name}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" sx={{ color: '#8B7355' }}>
          {item.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {item.description}
        </Typography>
        {item.tags.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {item.tags.map((tag, index) => (
              <Box 
                key={index} 
                sx={{ 
                  backgroundColor: '#E0D6C2', 
                  padding: '2px 8px', 
                  borderRadius: 1, 
                  fontSize: '0.75rem',
                  color: '#8B7355'
                }}
              >
                {tag}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
