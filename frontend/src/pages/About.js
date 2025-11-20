import React from "react";

// Example band data
const bands = [
  {
    name: "The Rockstars",
    image: "/ab1.jpg",
    description: "A classic rock group known for electrifying stage performances."
  },
  {
    name: "Jazz Masters",
    image: "/ab2.jpeg",
    description: "Masters of smooth jazz and improvisation."
  },
  {
    name: "Electro Beats",
    image: "/ab3.jpeg",
    description: "An innovative fusion band blending electronic and dance music."
  }
];

export default function About() {
  return (
    <div
      style={{
        background: "url('/bg.webp') no-repeat center center fixed",
        backgroundSize: "cover",
        minHeight: "100vh",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
          background: "transparent",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h1 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "20px", color: "#5b4149ff" }}>
          About My Music Band
        </h1>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#d2c2c2ff" }}>
          Welcome to the official website of My Music Band! We are passionate
          musicians dedicated to creating memorable experiences through our
          music. Our journey began several years ago, and since then, we have
          performed at numerous concerts and festivals, sharing our love for
          music with fans around the world.
        </p>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#d2c2c2ff" }}>
          Our style blends various genres to bring a unique sound that resonates
          with diverse audiences. We are committed to continuously evolving our
          music and connecting with listeners on a personal level.
        </p>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#d2c2c2ff" }}>
          Thank you for stopping by! Explore our discography, catch up on
          upcoming events, and get in touch through the contact page.
        </p>

        <h2 style={{ marginTop: "40px", fontSize: "2rem", color: "#d2c2c2ff" }}>
          Featured Bands
        </h2>
        <div
          style={{
            display: "flex",
            gap: "30px",
            flexWrap: "wrap",
            marginTop: "30px",
            justifyContent: "center",
          }}
        >
          {bands.map((band, i) => (
            <div
              key={i}
              style={{
                width: "250px",
                background: "#fff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(0,0,0,0.15)";
              }}
            >
              <img
                src={band.image}
                alt={band.name}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                }}
              />
              <div style={{ padding: "18px" }}>
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "1.3rem",
                    color: "#8c0432",
                  }}
                >
                  {band.name}
                </h3>
                <p style={{ margin: 0, color: "#555", fontSize: "0.95rem" }}>
                  {band.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
