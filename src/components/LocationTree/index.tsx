import React, { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import { TreeView, TreeItem } from '@mui/lab';
import { ChevronRight, Home, LocationOn, Edit, Delete, FolderOpen } from '@mui/icons-material';
import type { Room, Location } from '../../types';

interface LocationTreeProps {
  rooms: Room[];
  locations: Location[];
  onSelect: (locationId: string | null) => void;
  selectedLocationId: string | null;
  onEditLocation?: (locationId: string) => void;
  onDeleteLocation?: (locationId: string) => void;
  showActions?: boolean;
}

export const LocationTree: React.FC<LocationTreeProps> = ({
  rooms,
  locations,
  onSelect,
  selectedLocationId,
  onEditLocation,
  onDeleteLocation,
  showActions = false
}) => {
  const [expanded, setExpanded] = useState<string[]>(rooms.map(r => r.id));

  useEffect(() => {
    setExpanded(rooms.map(r => r.id));
  }, [rooms]);

  const handleToggle = (_event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const getLocationsByRoomId = (roomId: string) => {
    return locations.filter(location => location.room_id === roomId);
  };

  const getChildLocations = (parentId: string) => {
    return locations.filter(location => location.parent_id === parentId);
  };

  const renderLocationNode = (location: Location) => {
    const childLocations = getChildLocations(location.id);

    return (
      <TreeItem
        key={location.id}
        nodeId={location.id}
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: selectedLocationId === location.id ? '#E0D6C2' : 'transparent',
              padding: '8px 12px',
              borderRadius: '8px',
              width: '100%',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: selectedLocationId === location.id ? '#E0D6C2' : '#F0E6D2'
              }
            }}
            onClick={() => onSelect(location.id)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn fontSize="small" sx={{ marginRight: '8px', color: '#8B7355' }} />
              <Typography sx={{ color: '#8B7355' }}>{location.name}</Typography>
            </Box>
            {showActions && (
              <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                {onEditLocation && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditLocation(location.id);
                    }}
                    sx={{ color: '#8B7355', padding: '2px' }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                )}
                {onDeleteLocation && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLocation(location.id);
                    }}
                    sx={{ color: '#D32F2F', padding: '2px' }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
        }
      >
        {childLocations.map(childLocation => renderLocationNode(childLocation))}
      </TreeItem>
    );
  };

  // 空状态
  if (rooms.length === 0) {
    return (
      <Box sx={{
        textAlign: 'center',
        py: 4,
        color: '#8B7355',
        backgroundColor: '#F9F6F0',
        borderRadius: 2
      }}>
        <FolderOpen sx={{ fontSize: 48, color: '#E0D6C2', mb: 1 }} />
        <Typography variant="body2">
          还没有房间和位置
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, fontSize: '0.75rem', color: '#A08060' }}>
          请先在「设置」中添加房间和位置
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      border: '1px solid #E0D6C2',
      borderRadius: 2,
      p: 1,
      backgroundColor: '#F9F6F0'
    }}>
      {/* 提示信息 */}
      <Typography variant="body2" sx={{ color: '#A08060', px: 1, py: 1, mb: 1 }}>
        点击选择存放位置
      </Typography>

      <TreeView
        aria-label="location tree"
        defaultExpandIcon={<ChevronRight sx={{ color: '#8B7355' }} />}
        expanded={expanded}
        onNodeToggle={handleToggle}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          '& .MuiTreeItem-root': {
            '&:hover > .MuiTreeItem-content': {
              backgroundColor: 'transparent'
            }
          },
          '& .MuiTreeItem-content': {
            padding: '4px 0'
          }
        }}
      >
        {rooms.map(room => {
          const roomLocations = getLocationsByRoomId(room.id).filter(location => location.parent_id === null);

          return (
            <TreeItem
              key={room.id}
              nodeId={room.id}
              label={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    width: '100%'
                  }}
                >
                  <Home fontSize="small" sx={{ marginRight: '8px', color: '#4A6741' }} />
                  <Typography sx={{ color: '#8B7355', fontWeight: 500 }}>{room.name}</Typography>
                </Box>
              }
            >
              {roomLocations.length > 0 ? (
                roomLocations.map(location => renderLocationNode(location))
              ) : (
                <TreeItem
                  nodeId={`${room.id}-empty`}
                  label={
                    <Typography sx={{ color: '#A08060', fontSize: '0.875rem', fontStyle: 'italic', py: 1, px: 2 }}>
                      暂无位置
                    </Typography>
                  }
                />
              )}
            </TreeItem>
          );
        })}
      </TreeView>

      {/* 当前选择的位置 */}
      {selectedLocationId && (
        <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#E0D6C2', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: '#8B7355' }}>
            已选择：{locations.find(l => l.id === selectedLocationId)?.name || '未知位置'}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ color: '#4A6741', cursor: 'pointer', display: 'block', mt: 0.5 }}
            onClick={() => onSelect(null)}
          >
            点击清除选择
          </Typography>
        </Box>
      )}
    </Box>
  );
};