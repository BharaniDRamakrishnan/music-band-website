import React from 'react';
import { useParams } from 'react-router-dom';

const AlbumPage = () => {
  const { id } = useParams();

  return (
    <div className="album-page">
      <div className="album-header">
        <h1>Album Details</h1>
        <p>Album ID: {id}</p>
      </div>
      <div className="album-content">
        <p>Album information will be displayed here.</p>
        <p>This is a placeholder for the album page functionality.</p>
      </div>
    </div>
  );
};

export default AlbumPage;






















