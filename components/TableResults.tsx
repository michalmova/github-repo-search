// TODO: applied detailed ts types in the whole app
interface Props {
  repos: any,
}

const TableResults = ({ repos }: Props) => {
  const rowStyle = 'border border-black px-2'

  return (
    <>
      <table className="rowStyle">
        <tbody>
          <tr>
            <th className={rowStyle}>Name</th>
            <th className={rowStyle}>Owner</th>
            <th className={rowStyle}>Stars</th>
            <th className={rowStyle}>Created at</th>
          </tr>
          {repos.map((repo: any) => (
            <tr key={repo?.full_name}>
              <td className={rowStyle}>{repo?.name}</td>
              <td className={rowStyle}>{repo?.owner?.login}</td>
              <td className={rowStyle}>{repo?.stargazers_count}</td>
              <td className={rowStyle}>{repo?.created_at.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table >
    </>
  )
}

export default TableResults