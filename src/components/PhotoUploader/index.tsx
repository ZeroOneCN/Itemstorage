import React, { useState, useRef } from 'react';
import { Box, IconButton, Grid, Typography } from '@mui/material';
import { CameraAlt, AddPhotoAlternate, Delete } from '@mui/icons-material';

interface PhotoUploaderProps {
  photos: string[];
  mainPhoto: string | null;
  onPhotosChange: (photos: string[], mainPhoto: string | null) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  mainPhoto,
  onPhotosChange
}) => {
  const [fileInputKey, setFileInputKey] = useState(0);
  const [cameraInputKey, setCameraInputKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newPhotos = [...photos];
      
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await processFile(files[i]);
        newPhotos.push(dataUrl);
      }
      
      const newMainPhoto = mainPhoto || newPhotos[0];
      onPhotosChange(newPhotos, newMainPhoto);
    }
    setFileInputKey(prev => prev + 1);
  };

  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUrl = await processFile(file);
      const newPhotos = [...photos, dataUrl];
      const newMainPhoto = mainPhoto || dataUrl;
      onPhotosChange(newPhotos, newMainPhoto);
    }
    setCameraInputKey(prev => prev + 1);
  };

  const handleDeletePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    let newMainPhoto = mainPhoto;
    if (photos[index] === mainPhoto) {
      newMainPhoto = newPhotos.length > 0 ? newPhotos[0] : null;
    }
    onPhotosChange(newPhotos, newMainPhoto);
  };

  const handleSetMainPhoto = (photo: string) => {
    onPhotosChange(photos, photo);
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 2, fontWeight: 'bold' }}>
        照片
      </Typography>
      <Grid container spacing={2}>
        {/* 从相册选择 */}
        <Grid size={{ xs: 6, sm: 4 }}>
          <input
            ref={fileInputRef}
            key={fileInputKey}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
            id="photo-upload"
          />
          <Box
            component="label"
            htmlFor="photo-upload"
            sx={{
              border: '2px dashed #E0D6C2',
              borderRadius: 2,
              height: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F9F6F0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#4A6741',
                backgroundColor: '#F0E6D2'
              }
            }}
          >
            <AddPhotoAlternate sx={{ color: '#4A6741', mb: 1, fontSize: 32 }} />
            <Typography variant="body2" sx={{ color: '#8B7355' }}>
              从相册选择
            </Typography>
          </Box>
        </Grid>

        {/* 拍照 */}
        <Grid size={{ xs: 6, sm: 4 }}>
          <input
            ref={cameraInputRef}
            key={cameraInputKey}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            style={{ display: 'none' }}
            id="camera-capture"
          />
          <Box
            component="label"
            htmlFor="camera-capture"
            sx={{
              border: '2px dashed #E0D6C2',
              borderRadius: 2,
              height: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F9F6F0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#4A6741',
                backgroundColor: '#F0E6D2'
              }
            }}
          >
            <CameraAlt sx={{ color: '#4A6741', mb: 1, fontSize: 32 }} />
            <Typography variant="body2" sx={{ color: '#8B7355' }}>
              拍照
            </Typography>
          </Box>
        </Grid>

        {/* 已添加的照片 */}
        {photos.map((photo, index) => (
          <Grid size={{ xs: 6, sm: 4 }} key={index}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                border: mainPhoto === photo ? '3px solid #4A6741' : '2px solid #E0D6C2',
                transition: 'all 0.2s ease'
              }}
            >
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                style={{ 
                  width: '100%', 
                  height: 120, 
                  objectFit: 'cover', 
                  cursor: 'pointer',
                  display: 'block'
                }}
                onClick={() => handleSetMainPhoto(photo)}
              />
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)'
                  }
                }}
                onClick={() => handleDeletePhoto(index)}
              >
                <Delete fontSize="small" sx={{ color: '#D32F2F' }} />
              </IconButton>
              {mainPhoto === photo && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(74, 103, 65, 0.9)',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '4px',
                    textAlign: 'center'
                  }}
                >
                  主图
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {photos.length === 0 && (
        <Typography variant="body2" sx={{ color: '#A08060', mt: 2, textAlign: 'center' }}>
          点击上方按钮添加照片，可选择相册图片或直接拍照
        </Typography>
      )}
    </Box>
  );
};