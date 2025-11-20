import React from 'react';
import './Discography.css';

function Discography() {
  const albums = [
    {
      id: 1,
      title: "Midnight Dreams",
      year: "2024",
      genre: "Alternative Rock",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      tracks: [
        { name: "Midnight Dreams", duration: "3:45", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "Electric Storm", duration: "4:12", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "Ocean Waves", duration: "3:58", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "City Lights", duration: "4:30", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" }
      ],
      description: "Our latest album exploring themes of dreams, reality, and the spaces in between."
    },
    {
      id: 2,
      title: "Echo Chamber",
      year: "2023",
      genre: "Indie Rock",
      cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
      tracks: [
        { name: "Echo Chamber", duration: "3:22", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "Digital Love", duration: "4:05", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "Neon Nights", duration: "3:47", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "Future Past", duration: "4:18", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" }
      ],
      description: "A journey through digital landscapes and human connections in the modern age."
    },
    {
      id: 3,
      title: "Acoustic Sessions",
      year: "2022",
      genre: "Acoustic",
      cover: "https://images.unsplash.com/photo-1501281668745-f6f26125a572?w=400",
      tracks: [
        { name: "Acoustic Dreams", duration: "3:15", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "Gentle Rain", duration: "4:02", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "Mountain Air", duration: "3:55", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "Sunset Song", duration: "4:25", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" }
      ],
      description: "Intimate acoustic performances showcasing the raw emotion of our music."
    },
    {
      id: 4,
      title: "First Light",
      year: "2021",
      genre: "Rock",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      tracks: [
        { name: "First Light", duration: "3:38", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "Breaking Dawn", duration: "4:15", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "New Day", duration: "3:42", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        { name: "Rising Sun", duration: "4:08", audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" }
      ],
      description: "Our debut album that started it all - the beginning of our musical journey."
    }
  ];

  return (
    <div className="discography-container">
      <div className="discography-header">
        <h1>Discography</h1>
        <p>Explore our musical journey through the years</p>
      </div>

      <div className="albums-grid">
        {albums.map((album) => (
          <div key={album.id} className="album-card">
            <div className="album-cover">
              <img src={album.cover} alt={album.title} />
              <div className="album-overlay">
                <span className="album-year">{album.year}</span>
                <span className="album-genre">{album.genre}</span>
              </div>
            </div>
            
            <div className="album-info">
              <h3 className="album-title">{album.title}</h3>
              <p className="album-description">{album.description}</p>
              
              <div className="album-tracks">
                <h4>Track List</h4>
                <div className="tracks-list">
                  {album.tracks.map((track, index) => (
                    <div key={index} className="track-item">
                      <div className="track-info">
                        <span className="track-number">{index + 1}</span>
                        <span className="track-name">{track.name}</span>
                        <span className="track-duration">{track.duration}</span>
                      </div>
                      <audio controls className="audio-player">
                        <source src={track.audio} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="discography-footer">
        <div className="stats-section">
          <div className="stat-item">
            <h3>4</h3>
            <p>Albums Released</p>
          </div>
          <div className="stat-item">
            <h3>16</h3>
            <p>Total Tracks</p>
          </div>
          <div className="stat-item">
            <h3>4</h3>
            <p>Years Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Discography;
