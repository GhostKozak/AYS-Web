import './App.css'
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();

  return (
    <>
      <h1>{t("HELLO")}</h1>
      <div className="card">
        <button onClick={() => i18n.changeLanguage(i18n.language === "tr" ? "en" : "tr")}>
          Dili değiştir ({i18n.language})
        </button>
      </div>
    </>
  )
}

export default App
