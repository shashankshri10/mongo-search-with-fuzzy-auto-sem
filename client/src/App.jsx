/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'

function App() {
  const [search, setSearch] = React.useState('')
  const [searchView, setSearchView] = React.useState('')
  const [data, setData] = React.useState([])
  const [dataAuto, setDataAuto] = React.useState([])
  const [flag, setFlag] = React.useState(false)
  const [flagAuto, setFlagAuto] = React.useState(true)
  const [flagSearch, setFlagSearch] = React.useState(false)
  const [nullmessage, setNullmessage] = React.useState("")
  const [searchmsg, setSearchmsg] = React.useState("")
  const [movieName, setMovieName] = React.useState("")
  const [moviePlot, setMoviePlot] = React.useState("")
  const [moviePoster, setMoviePoster] = React.useState("")
  document.addEventListener('click', function(){
    setFlagAuto(false)
  })
  useEffect(()=>{
    async function handleSearchAuto(){
      console.log('Search value: ', search);
      if(search === ""){
        setFlagAuto(false)
        return
      }
      await fetch(`http://localhost:5000/search-autocomplete?search=${search}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        setDataAuto(data)
        if(dataAuto){
          setFlagAuto(true)
        }
        else{
          setFlagAuto(false)
        }
      })
    }
    handleSearchAuto()
  },[search])
  
  async function handleMovieSearch(title){
    setFlagAuto(false)
    setFlag(false)
    setFlagSearch(true)
    setNullmessage("")
    console.log('Search value: ', title);
    fetch(`http://localhost:5000/search-movie?search=${title}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if(data){
        setFlagSearch(true)
        console.log(data);
      }
      setMovieName(data[0].title)
      console.log(movieName)
      setMoviePlot(data[0].plot)
      console.log(moviePlot)
      setMoviePoster(data[0].poster)
    })
  }

  async function handleSearch(e){
    if(!search){
      setNullmessage("Search value not provided")
      setFlag(false)
      return
    }
    setNullmessage("loading...")
    setSearchmsg(`Search results for ${search}`)
    setFlagAuto(false)
    setFlag(false)
    e.preventDefault()
    console.log('Search value: ', search);
    await fetch(`http://localhost:5000/search-fuzzy?search=${search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      setData(data)
      if(data){
        setFlag(true)
      }
    })
  }
  return (
    <div className='w-screen flex flex-col justify-center items-center select-none'>
      <h1 className='text-2xl font-extrabold'>Atlas Search</h1>
      <h2 className='text-lg font-semibold'>Search for a movie</h2>
      <form>
        <input className='border-2 border-black border-solid' onChange={(event)=>{
          setSearchView(event.target.value)
          setSearch((event.target.value).replace(' ','%'))
        }} value={searchView} type="text" placeholder="Search for a movie" />
        <button className='bg-[yellow] hover:bg-[purple] hover:text-white border-2 border-solid border-orange-500 px-4 py-1 rounded-md' onClick={handleSearch}>Search</button>
      </form>
      {flagAuto?(
        <div onClick={e=>{
          e.stopPropagation()
        }} className='bg-[limegreen] max-w-max px-2'>
          <h2 className='font-bold mb-2 pt-2 bg-[orangered] w-full'>This is autocomplete suggestions box</h2>
          <ul>
            {dataAuto.map((movie, index) => {
              return <li className='cursor-pointer hover:bg-[#b9eeb9]' onClick={(e)=>{
                e.preventDefault()
                handleMovieSearch(movie.title)
              }} key={index}>{movie.title}</li>
            })}
          </ul>
        </div>
        ):null}
      {flag?(
        <div className='bg-[cyan] absolute -z-10 top-[100px]'>
          <h2 className='font-bold mb-2 pt-2 bg-[#8f39c9] w-full'>{searchmsg}</h2>
          <ul>
            {data.map((movie, index) => {
              return <li className='cursor-pointer hover:bg-[#ace1e1]' onClick={(e)=>{
                e.preventDefault()
                handleMovieSearch(movie.title)
              }} key={index}>{movie.title}</li>
            })}
          </ul>
        </div>
        ):<div>
        <p>{nullmessage}</p>
      </div>}
      {flagSearch?(
        <div className='max-w-[200px] bg-[pink] p-2'>
          <section>
            <h1 className='my-2 bg-purple-500'>{movieName}</h1>
            <p className='my-2'>{moviePlot}</p>
            <a className='bg-[blue] text-white px-2 py-1 cursor-pointer' href={moviePoster}>
              Link to poster
            </a>
          </section>
        </div>
      ):null}
    </div>
  )
}

export default App