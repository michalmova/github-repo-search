'use client'

import TableResults from "@/components/TableResults"
import { useEffect, useMemo, useRef, useState } from "react"

const DEBOUNCE_DELAY = 2000
type PerPageType = 5 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 100

export default function Home() {
  const [repos, setRepos] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [perPage, setPerPage] = useState<PerPageType>(30);

  let timeoutId = useRef<any>(null)

  const fetchData = async () => {
    if (!searchText) return

    // 'per_page' param set to 100 which is the max the github API can return 
    // this allows to change the displayed rows locally without calling the api again
    /* 
      TODO: make a pagination using links from response header or 
      based on 'total_count' make another calls with the 'page' param,
      partially the pagination can be done locally in the range up to 100 rows,
      the url can be change to be more dynamic (other params)
    */
    const searchUrl = `https://api.github.com/search/repositories?q=${searchText}&sort=stars&order=desc&per_page=100`

    // Caching in local storage // TODO: localStorage is limited so better option will be to use browser cache storage
    const cachedReposRaw = localStorage.getItem('cachedRepos')
    const cachedRepos = cachedReposRaw && JSON.parse(cachedReposRaw)

    if (cachedRepos && cachedRepos[searchUrl]) {
      return setRepos(cachedRepos[searchUrl].items)
    }

    try {
      setError(null)
      setIsLoading(true)

      const res = await fetch(searchUrl)
      const fetchedRepos = await res.json()

      if (fetchedRepos.items) {
        setRepos(fetchedRepos.items)
        localStorage.setItem('cachedRepos', JSON.stringify({ ...cachedRepos, [searchUrl]: fetchedRepos }))
      } else {
        setError(fetchedRepos.message)
      }

    } catch (e: any) {
      setError(e)

    } finally {
      setIsLoading(false)
    }
  }

  // Debouncer // TODO: make it as a reusable hook
  const debounce = (fn: () => void, delay: number = 2000) => {
    clearTimeout(timeoutId.current)
    timeoutId.current = setTimeout(fn, delay)
  }

  const displayedRepos: any = useMemo(() => {
    return repos.slice(0, perPage)
  },
    [repos, perPage]
  )

  useEffect(() => {
    debounce(fetchData, DEBOUNCE_DELAY)
  }, [searchText])

  const handleSearchChange = (e: any) => {
    setSearchText(e.target.value)
  }

  const handlePerPageChange = (e: any) => {
    setPerPage(e.target.value)
  }

  return (
    <main className="flex gap-6 flex-col items-center justify-between p-24 text-xl">
      <input
        type="text"
        value={searchText}
        onChange={handleSearchChange}
        placeholder="Find a repo..."
        className="border border-black rounded p-4"
      />
      <button
        className="border border-black rounded-md p-2 w-[200px]"
        onClick={fetchData}
      >
        {isLoading ? 'Loading...' : 'Search'}
      </button>

      {/* Rows per page selector 
      // TODO: make it as a separate reusable component
      */}
      <span>
        <label className="mr-2">Displayed rows:</label>
        <select value={perPage} onChange={handlePerPageChange}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={40}>40</option>
          <option value={50}>50</option>
          <option value={60}>60</option>
          <option value={70}>70</option>
          <option value={80}>80</option>
          <option value={90}>90</option>
          <option value={100}>100</option>
        </select>
      </span>

      <div className="text-red-600">{error}</div>
      {repos.length > 0 && <TableResults repos={displayedRepos} />}
    </main >
  );
}
