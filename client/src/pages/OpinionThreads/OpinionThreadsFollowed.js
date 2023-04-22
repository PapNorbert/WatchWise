import React, { useEffect, useState } from 'react'
import { useLocation, Navigate } from "react-router-dom"
import { useParams } from "react-router-dom"

import OpinionThread from '../../components/OpinionThread'
import Limit from '../../components/Limit'
import PaginationElements from '../../components/PaginationElements'
import useGetAxios from '../../hooks/useGetAxios'
import useAuth from '../../hooks/useAuth'
import { convertKeyToSelectedLanguage } from '../../i18n/conversion'
import useLanguage from '../../hooks/useLanguage'
import { buttonTypes} from '../../util/buttonTypes'


export default function OpinionThreadsFollowed() {
  // querry parameters
  const { userId: userID } = useParams();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [url, setUrl] = useState(`/api/opinion_threads?userId=${userID}&followed=true`);
  const { auth, setAuth, setLoginExpired } = useAuth();
  const { data: opinion_threads, error, statusCode, loading, refetch } = useGetAxios(url);
  const location = useLocation();
  const { i18nData } = useLanguage();


  useEffect(() => {
    setUrl(`/api/opinion_threads/?userId=${userID}&followed=true&page=${page}&limit=${limit}`);
  }, [limit, page, userID])

  useEffect(() => {
    if (opinion_threads?.data.length === 0) {
      // if we get an empty page load the previous
      setPage(prev => prev > 1 ? prev - 1 : 1);
    }
  }, [opinion_threads?.data])


  if (statusCode === 401) {
    if (auth.logged_in) {
      setAuth({ logged_in: false });
      setLoginExpired(true);
    }
  }

  if (statusCode === 403) {
    return <Navigate to='/unauthorized' state={{ from: location }} replace />
  }

  if (loading) {
    return <h3 className='loading'>{convertKeyToSelectedLanguage('loading',i18nData)}</h3>
  }

  if (error) {
    return <h2 className='error'>{convertKeyToSelectedLanguage('error', i18nData)}</h2>
  }
  
  return ( opinion_threads &&
    <>
      <Limit limit={limit} setLimit={setLimit} setPage={setPage} key='limit' />
      <PaginationElements currentPage={page}
        totalPages={opinion_threads?.pagination.totalPages}
        onPageChange={setPage} key='pagination-top' />
      {opinion_threads?.data.length > 0 ?
        // there are elements returned
        opinion_threads?.data.map(currentElement => {
          return (
            <OpinionThread opinion_thread={currentElement} buttonType={buttonTypes.leave}
              removeOnLeave={true} refetch={refetch} key={currentElement._key} />
          );
        }) :
        // no elements returned
        <h2>{convertKeyToSelectedLanguage('no_followed_threads',i18nData)}</h2>
      }
      <PaginationElements currentPage={page}
        totalPages={opinion_threads?.pagination.totalPages}
        onPageChange={setPage} key='pagination-bottom' />
    </>
  )
}