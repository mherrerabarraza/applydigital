import './App.css'
import NavBar from './components/NavBar'
import HeroSection from './components/HeroSection'
import Footer from './components/Footer'

const FEATURE_CARDS = [
  {
    id: 'card-1',
    title: 'Precision Engineering',
    body: 'Every detail is considered. Every interaction is refined. We craft digital products that feel as good as they look.',
  },
  {
    id: 'card-2',
    title: 'Intelligent Design',
    body: 'Design that adapts to your needs. Smart systems built to scale, evolve, and deliver impact from day one.',
  },
  {
    id: 'card-3',
    title: 'Seamless Experience',
    body: 'From onboarding to everyday use, we eliminate friction and create experiences your users will love.',
  },
]

function App() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <section className="section" aria-labelledby="features-heading">
          <div className="content-wrapper">
            <h2 className="headline" id="features-heading">
              Built for what matters.
            </h2>
            <div className="card-grid">
              {FEATURE_CARDS.map((card) => (
                <article className="card" key={card.id}>
                  <h3 className="card__title">{card.title}</h3>
                  <p className="card__body">{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default App
