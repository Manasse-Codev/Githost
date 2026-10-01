import { useState, useEffect } from 'react'

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  updated_at: string
  created_at: string
  topics: string[]
  fork: boolean
  size: number
  homepage: string | null
}

interface UserProfile {
  login: string
  avatar_url: string
  name: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
  html_url: string
}

function App() {
  const [username, setUsername] = useState('')
  const [repos, setRepos] = useState<Repository[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name'>('updated')
  const [filterLang, setFilterLang] = useState<string>('all')

  const fetchRepos = async (user: string) => {
    setLoading(true)
    setError('')
    setSearched(true)

    try {
      // Fetch user profile
      const userRes = await fetch(`https://api.github.com/users/${user}`)
      if (!userRes.ok) {
        if (userRes.status === 404) {
          throw new Error('Utilisateur GitHub introuvable')
        }
        throw new Error('Erreur lors de la récupération du profil')
      }
      const userData = await userRes.json()
      setUser(userData)

      // Fetch repositories
      const reposRes = await fetch(
        `https://api.github.com/users/${user}/repos?per_page=100&sort=updated`
      )
      if (!reposRes.ok) {
        throw new Error('Erreur lors de la récupération des repositories')
      }
      const reposData = await reposRes.json()
      setRepos(reposData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setRepos([])
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      fetchRepos(username.trim())
    }
  }

  // Get unique languages
  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))] as string[]

  // Filter and sort repos
  const filteredRepos = repos
    .filter((r) => !r.fork)
    .filter((r) => filterLang === 'all' || r.language === filterLang)
    .sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
      if (sortBy === 'stars') {
        return b.stargazers_count - a.stargazers_count
      }
      return a.name.localeCompare(b.name)
    })

  // Load default user on mount
  useEffect(() => {
    fetchRepos('torvalds')
    setUsername('torvalds')
  }, [])

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      C: '#555555',
      'C#': '#178600',
      Go: '#00ADD8',
      Rust: '#dea584',
      Ruby: '#701516',
      PHP: '#4F5D95',
      Swift: '#F05138',
      Kotlin: '#A97BFF',
      Dart: '#00B4AB',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Shell: '#89e051',
      Vue: '#41b883',
      'Jupyter Notebook': '#DA5B0B',
    }
    return colors[lang] || '#8b8b8b'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700/50 backdrop-blur-sm bg-gray-900/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <i className="fab fa-github text-3xl text-white"></i>
          <h1 className="text-xl font-bold">GitHub Projects Explorer</h1>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez un nom d'utilisateur GitHub..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800/80 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-medium transition-all flex items-center gap-2"
          >
            {loading ? (
              <i className="fas fa-spinner animate-spin"></i>
            ) : (
              <i className="fas fa-search"></i>
            )}
            Rechercher
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 flex items-center gap-3">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {/* User Profile */}
        {user && (
          <div className="mt-8 p-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl backdrop-blur-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-6">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-20 h-20 rounded-full border-2 border-blue-500/50"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{user.name || user.login}</h2>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  @{user.login}
                </a>
                {user.bio && <p className="text-gray-300 mt-2">{user.bio}</p>}
              </div>
            </div>
            <div className="flex gap-6 mt-4 text-sm text-gray-400">
              <span>
                <i className="fas fa-book mr-1"></i> {user.public_repos} repos
              </span>
              <span>
                <i className="fas fa-users mr-1"></i> {user.followers} followers
              </span>
              <span>
                <i className="fas fa-user-plus mr-1"></i> {user.following} following
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        {repos.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Trier par :</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'updated' | 'stars' | 'name')}
                className="bg-gray-800 border border-gray-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="updated">Dernière mise à jour</option>
                <option value="stars">Étoiles</option>
                <option value="name">Nom</option>
              </select>
            </div>
            {languages.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Langage :</label>
                <select
                  value={filterLang}
                  onChange={(e) => setFilterLang(e.target.value)}
                  className="bg-gray-800 border border-gray-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <span className="text-sm text-gray-400 ml-auto">
              {filteredRepos.length} projet{filteredRepos.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Repositories Grid */}
        {loading && (
          <div className="mt-12 flex justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-400">Chargement des projets...</p>
            </div>
          </div>
        )}

        {!loading && filteredRepos.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-blue-400 group-hover:text-blue-300 truncate flex-1">
                    <i className="fas fa-book-bookmark mr-2 text-xs"></i>
                    {repo.name}
                  </h3>
                </div>

                {repo.description && (
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                    {repo.description}
                  </p>
                )}

                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {repo.topics.slice(0, 4).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 bg-blue-900/30 text-blue-300 text-xs rounded-full border border-blue-700/30"
                      >
                        {topic}
                      </span>
                    ))}
                    {repo.topics.length > 4 && (
                      <span className="text-xs text-gray-500">+{repo.topics.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getLanguageColor(repo.language) }}
                      ></span>
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <i className="fas fa-star text-yellow-500/80"></i>
                    {repo.stargazers_count.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-code-branch text-gray-400"></i>
                    {repo.forks_count.toLocaleString()}
                  </span>
                  <span className="ml-auto">
                    {formatDate(repo.updated_at)}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        {!loading && searched && repos.length === 0 && !error && (
          <div className="mt-12 text-center text-gray-400">
            <i className="fas fa-inbox text-4xl mb-4 block"></i>
            <p>Aucun repository trouvé pour cet utilisateur.</p>
          </div>
        )}

        {!loading && searched && filteredRepos.length === 0 && repos.length > 0 && (
          <div className="mt-12 text-center text-gray-400">
            <i className="fas fa-filter text-4xl mb-4 block"></i>
            <p>Aucun projet ne correspond aux filtres sélectionnés.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 mt-16 py-6 text-center text-gray-500 text-sm">
        <p>
          <i className="fab fa-github mr-2"></i>
          GitHub Projects Explorer — Propulsé par l'API GitHub
        </p>
      </footer>
    </div>
  )
}

export default App
