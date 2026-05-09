import { useLanguage } from '../contexts/LanguageContext';

const UWB_IMAGE_URL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXh6XCFOXCVjhd8WxCUnhZ3wF8BrNdO9UbDw&s';

// Funkcja służy do renderowania strony informacyjnej o projekcie.
export default function About() {
  const { t } = useLanguage();
  return (
    <div className="about-page">
      <img className="about-image" src={UWB_IMAGE_URL} alt="Filia UWB" />
      <section className="about-content">
        <h1 className="about-title">{t.about.title}</h1>
        <p className="about-text">{t.about.description}</p>
      </section>
    </div>
  );
}
