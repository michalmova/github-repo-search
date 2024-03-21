'use client'

import TableResults from "@/components/TableResults"
import { useEffect, useRef, useState } from "react"

const DEBOUNCE_DELAY = 2000

export default function Home() {
  const [repos, setRepos] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchText, setSearchText] = useState('')

  let timeoutId = useRef<any>(null)


  const fetchData = async () => {
    const searchUrl = `https://api.github.com/search/repositories?q=${searchText}&sort=stars&order=desc`

    try {
      setError(null)
      setIsLoading(true)

      const res = await fetch(searchUrl)
      const fetchedRepos = await res.json()

      if (fetchedRepos.items) {
        setRepos(fetchedRepos.items)
      } else {
        setError(fetchedRepos.message)
      }

    } catch (e: any) {
      setError(e)

    } finally {
      setIsLoading(false)
    }
  }

  // TODO: make it as a reusable hook
  const debounce = (fn: () => void, delay: number = 2000) => {
    clearTimeout(timeoutId.current)
    timeoutId.current = setTimeout(fn, delay)
  }

  useEffect(() => {
    debounce(fetchData, DEBOUNCE_DELAY)
  }, [searchText])

  const handleSearchChange = (e: any) => {
    setSearchText(e.target.value)
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

      <div className="text-red-600">{error}</div>
      {repos.length > 0 && <TableResults repos={repos} />}
    </main >
  );
}
