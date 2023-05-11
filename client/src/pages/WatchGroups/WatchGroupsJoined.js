import React, { useEffect, useState } from 'react'
import { useLocation, Navigate } from "react-router-dom"
import { useParams } from "react-router-dom"

import WatchGroup from '../../components/WatchGroup'
import Limit from '../../components/Limit'
import PaginationElements from '../../components/PaginationElements'
import useGetAxios from '../../hooks/useGetAxios'
import useAuth from '../../hooks/useAuth'
import { convertKeyToSelectedLanguage } from '../../i18n/conversion'
import useLanguage from '../../hooks/useLanguage'
import { buttonTypes } from '../../util/buttonTypes'
import { querryParamDefaultValues, querryParamNames, limitValues } from '../../config/querryParams'
import { useSearchParamsState } from '../../hooks/useSearchParamsState'

export default function WatchGroupsJoined() {
  // querry parameters
  const { userId: userID } = useParams();
  const [limit, setLimit] =
    useSearchParamsState(querryParamNames.limit, querryParamDefaultValues.limit);
  const [page, setPage] = useSearchParamsState(querryParamNames.page, querryParamDefaultValues.page);
  const [url, setUrl] = useState(`/api/watch_groups?userId=${userID}&joined=true`);
  const { data: watch_groups, error, statusCode, loading, refetch } = useGetAxios(url);
  const { auth, setAuth, setLoginExpired } = useAuth()
  const location = useLocation();
  const { i18nData } = useLanguage();
  const [userLocation, setUserLocation] = useState([null, null]);

  useEffect(() => {
    // update position if location of user is available
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation([
        position.coords.latitude,
        position.coords.longitude
      ]);
    },
      (err) => {
        if (err.code === 1) {
          // user denied location
        } else {
          console.log(err.message);
        }
      }
    );
  }, [])


  useEffect(() => {
    if (watch_groups?.pagination.totalPages === 0) {
      // no data
      if (parseInt(page) !== 1) {
        setPage(1);
      }
    } else {
      // eslint-disable-next-line eqeqeq
      if (parseInt(limit) != limit) {
        setLimit(querryParamDefaultValues.limit);
        // eslint-disable-next-line eqeqeq
      } else if (parseInt(page) != page) {
        setPage(querryParamDefaultValues.page);
      } else if (!limitValues.includes(parseInt(limit))) {
        setLimit(querryParamDefaultValues.limit);
      } else if (page > watch_groups?.pagination.totalPages && page > 1) {
        setPage(watch_groups?.pagination.totalPages);
      } else {
        // limit and page have correct values
        if (userLocation[0] && userLocation[1]) {
          setUrl(`/api/watch_groups/?userId=${userID}&joined=true&page=${page}&limit=${limit}&userLocLat=${userLocation[0]}&userLocLong=${userLocation[1]}`);
        } else {
          setUrl(`/api/watch_groups/?userId=${userID}&joined=true&page=${page}&limit=${limit}`);
        }
      }
    }
  }, [limit, page, setLimit, setPage, userID, userLocation, watch_groups?.pagination.totalPages])


  if (statusCode === 401) {
    if (auth.logged_in) {
      setAuth({ logged_in: false });
      setLoginExpired(true);
    }
  }

  if (statusCode === 403) {
    return <Navigate to='/unauthorized' state={{ from: location }} replace />
  }

  if (statusCode === 503) {
    return <h2 className='error'>{convertKeyToSelectedLanguage('server_no_resp', i18nData)}</h2>
  }

  if (loading) {
    return <h3 className='loading'>{convertKeyToSelectedLanguage('loading', i18nData)}</h3>
  }

  if (error) {
    return <h2 className='error'>{convertKeyToSelectedLanguage('error', i18nData)}</h2>
  }

  return (watch_groups &&
    <>
      <Limit limit={limit} key='limit' />
      <PaginationElements currentPage={parseInt(page)}
        totalPages={watch_groups?.pagination.totalPages}
        onPageChange={setPage} key='pagination-top' />
      {watch_groups?.data.length > 0 ?
        // there are elements returned
        watch_groups?.data.map(currentElement => {
          return (
            <WatchGroup watch_group={currentElement} buttonType={buttonTypes.leave}
              removeOnLeave={true} refetch={refetch} key={currentElement._key} />
          );
        }) :
        // no elements returned
        <h2>{convertKeyToSelectedLanguage('no_joined_groups', i18nData)}</h2>
      }
      <PaginationElements currentPage={parseInt(page)}
        totalPages={watch_groups?.pagination.totalPages}
        onPageChange={setPage} key='pagination-bottom' />
    </>
  )
}
