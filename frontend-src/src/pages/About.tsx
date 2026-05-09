const UWB_IMAGE_URL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXh6XCFOXCVjhd8WxCUnhZ3wF8BrNdO9UbDw&s';

// Funkcja służy do renderowania strony informacyjnej o projekcie.
export default function About() {
  return (
    <div className="about-page">
      <img className="about-image" src={UWB_IMAGE_URL} alt="Filia UWB" />
      <section className="about-content">
        <h1 className="about-title">A Smart Archive of Student Projects</h1>
        <p className="about-text">
          Inteligentne archiwum projektów studenckich pozwala gromadzić, opisywać i analizować projekty
          tworzone przez studentów. System pomaga porządkować dorobek projektowy, wykrywać technologie
          oraz prezentować wybrane prace w formie portfolio.
        </p>
      </section>
    </div>
  );
}
