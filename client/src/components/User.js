import React, { useState } from 'react'
import { Card, Alert, Row, Col } from 'react-bootstrap'

import useLanguage from '../hooks/useLanguage'
import { convertKeyToSelectedLanguage, convertDateAndTimeToLocale } from '../i18n/conversion'


export default function User({ user }) {
  const [requestError, setRequestError] = useState(null);
  const { i18nData } = useLanguage();
  const { language } = useLanguage();


  return (
    <>
      <Card key={`container_${user._key}`} className='mt-4 mb-3'>
        <Card.Header as='h5' key={`header${user._key}`} >
          {user.username}

        </Card.Header>

        <Card.Body>
          {Object.keys(user).map((key, index) => {
            if (key === 'username' || key === '_key') {
              return null;
            }

            return (
              <Row key={`${user._key}_${index}`} className='justify-content-md-center'>
                <Col xs lg={4} className='object-label' key={`${user._key}_label${index}`} >
                  {key === 'create_date' ?
                    convertKeyToSelectedLanguage('creation_date', i18nData)
                    :
                    convertKeyToSelectedLanguage(key, i18nData)
                  }
                </Col>
                <Col xs lg={7} key={`${user._key}_value${index}`} >
                  {key === 'create_date' ?
                    convertDateAndTimeToLocale(user[key], language)
                    :
                    user[key]
                  }
                </Col>

              </Row>
            );
          })}
        </Card.Body>
      </Card>
      <Alert key='danger' variant='danger' show={requestError !== null}
        onClose={() => setRequestError(null)} dismissible >
        {convertKeyToSelectedLanguage(requestError, i18nData)}
      </Alert>
    </>
  )
}
