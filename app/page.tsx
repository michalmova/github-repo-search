'use client'

import TableResults from "@/components/TableResults"
import { useEffect, useMemo, useRef, useState } from "react"

const DEBOUNCE_DELAY = 2000
type PerPageType = 5 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 100
type SortType = 'name' | 'owner' | 'stars' | 'created_at'

//TODO: write some test using e.g. Jest

export default function Home() {
  const [repos, setRepos] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [perPage, setPerPage] = useState<PerPageType>(30);
  const [sort, setSort] = useState<SortType>('stars')

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

    // Caching in local storage 
    /* 
     TODO: localStorage is limited so better option will be to use browser cache storage
     TODO: regarding "Updating the current URL on query change or table sort, so we get the same results when the page gets refreshed." -
     we can make it in a different way (depends on demands) - store all the search params data e.g. in the local storage 
     and during the first render we could take it and applied to the app
     OR we can try to use 'useRouter' hook from Next js with a method 'push' to change the current url without reloading
     */
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

  // Sorting locally 
  /* 
    TODO: make it more flexible - add sorting options by clicking a column name - make it asc/desc interchangeably;
    separate this function to some Utils folder
  */
  const sortReposBy: any = (repositories: any, sort: SortType) => {
    const sortedRepos = repositories.sort((a: any, b: any) => {
      if (sort === 'name') { return a.name.toString().localeCompare(b.name.toString()) }
      if (sort === 'owner') { return a.owner.login.toString().localeCompare(b.owner.login.toString()) }
      if (sort === 'stars') { return b.stargazers_count - a.stargazers_count }
      if (sort === 'created_at') { return b.created_at.toString().localeCompare(a.created_at.toString()) }
    })
    return sortedRepos
  }

  const displayedRepos: any = useMemo(() => {
    return sortReposBy(repos.slice(0, perPage), sort)
  },
    [repos, perPage, sort]
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

  const handleSortByChange = (e: any) => {
    setSort(e.target.value)
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
        disabled
      >
        {isLoading ? 'Loading...' : 'Search'}
      </button>

      {/* Rows per page selector 
       TODO: make it as a separate reusable component
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

      {/* Sort by selector
        TODO: make it as a separate reusable component
      */}
      <span>
        <label className="mr-2">Sort by:</label>
        <select value={sort} onChange={handleSortByChange}>
          <option value='name'>name</option>
          <option value='owner'>owner</option>
          <option value='stars'>stars</option>
          <option value='created_at'>created_at</option>
        </select>
      </span>

      <div className="text-red-600">{error}</div>
      {repos.length > 0 && <TableResults repos={displayedRepos} />}
    </main >
  );
}
