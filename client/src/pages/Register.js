import React, { useState } from 'react'
import { Form, FloatingLabel, Button, Alert, Nav, Row, Col } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import { useNavigate } from 'react-router-dom'

import { convertKeyToSelectedLanguage } from '../i18n/conversion'
import { postRequest } from '../axiosRequests/PostAxios'
import useLanguage from '../hooks/useLanguage'


export default function Register() {
  const { i18nData } = useLanguage(0);
  const emptyForm = {
    'first_name': '',
    'last_name': '',
    'username': '',
    'about_me': '',
    'passwd': '',
    'passwd_confirm': ''
  }
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [succesfullReg, setSuccesfullReg] = useState(false);
  // axios post 
  const url = '/api/auth/register'
  const [submitError, setSubmitError] = useState(null);
  // navigation
  const navigate = useNavigate();


  function setField(field, value) {
    const newForm = { ...form, [field]: value }
    setForm(newForm); // only changes value of the selected field
    let newErrors = { ...errors }
    if (!value || value === '') {
      newErrors = { ...errors, [field]: `empty_${field}` }
    } else if (errors[field] !== null) {
      newErrors = { ...errors, [field]: null }
    }
    setErrors(newErrors);
  }

  function handleSubmit(e) {
    e.preventDefault();
    let noErrors = true;
    const newErrors = {}
    for (const [key, value] of Object.entries(form)) {
      if (!value || value === '') {
        newErrors[key] = `empty_${key}`;
        noErrors = false;
      }
      if (key === 'passwd') {
        if (!value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\-_*!@#$%^&*()<>.,~|:;]{8,}$/gm)) {
          // password must be at least 8 long, with 1 digit, lowercase letter, uppercase letter
          noErrors = false;
          newErrors[key] = `error_passwd`;
        }
      }
      if (key === 'passwd_confirm' && value !== form['passwd']) {
        noErrors = false;
        newErrors[key] = `match_error_passwd`;
      }
    }
    setErrors(newErrors);
    if (noErrors) {
      let registered = false;
      postRequest(url, form)
        .then((res) => {
          if (!res.error && res.statusCode === 201) {
            // 201 expected
            registered = true;
            // Clear form inputs
            setForm(emptyForm);
            navigate('/login');
          }
          setSubmitError(res.errorMessage);
        })
        .catch((err) => {
          noErrors = false;
          console.log('Error during post request', err.message);
        })
        .finally(() => {
          setSuccesfullReg(registered);
        });
    } else {
      setSuccesfullReg(false);
    }
  }

  return (
    <FormContainer className='form-container'>
      <Form className='justify-content-md-center mt-5' onSubmit={handleSubmit} >
        <h2 className='text-center'>{convertKeyToSelectedLanguage('registration', i18nData)}</h2>

        <Row>
          <Col>
            <FloatingLabel controlId='floatingFirstNameInput'
              label={convertKeyToSelectedLanguage('first_name', i18nData)} className='mb-3' >
              <Form.Control type='text' placeholder={convertKeyToSelectedLanguage('first_name', i18nData)}
                value={form.first_name} isInvalid={errors.first_name} autoComplete='off'
                onChange={e => { setField('first_name', e.target.value) }} />
              <Form.Control.Feedback type='invalid'>
                {convertKeyToSelectedLanguage(errors['first_name'], i18nData)}
              </Form.Control.Feedback>
            </FloatingLabel>
          </Col>

          <Col>
            <FloatingLabel controlId='floatingLastNameInput'
              label={convertKeyToSelectedLanguage('last_name', i18nData)} className='mb-3' >
              <Form.Control type='text' placeholder={convertKeyToSelectedLanguage('last_name', i18nData)}
                value={form.last_name} isInvalid={!!errors.last_name} autoComplete='off'
                onChange={e => { setField('last_name', e.target.value) }} />
              <Form.Control.Feedback type='invalid'>
                {convertKeyToSelectedLanguage(errors['last_name'], i18nData)}
              </Form.Control.Feedback>
            </FloatingLabel>
          </Col>
        </Row>



        <FloatingLabel controlId='floatingUsernameInput'
          label={convertKeyToSelectedLanguage('username', i18nData)} className='mb-3' >
          <Form.Control type='text' placeholder={convertKeyToSelectedLanguage('username', i18nData)}
            value={form.username} isInvalid={!!errors.username} autoComplete='off'
            onChange={e => { setField('username', e.target.value) }} />
          <Form.Control.Feedback type='invalid'>
            {convertKeyToSelectedLanguage(errors['username'], i18nData)}
          </Form.Control.Feedback>
        </FloatingLabel>

        <span className='about_me'>
          <Form.Label>
            {convertKeyToSelectedLanguage('about_me', i18nData)}
          </Form.Label>
          <Form.Control as='textarea' rows={3}
            placeholder={convertKeyToSelectedLanguage('about_me', i18nData)}
            value={form.about_me} isInvalid={!!errors.about_me} autoComplete='off'
            onChange={e => { setField('about_me', e.target.value) }} />
          <Form.Text className='text-muted'>
            {convertKeyToSelectedLanguage('about_me_guide', i18nData)}
          </Form.Text>
          <Form.Control.Feedback type='invalid' >
            {convertKeyToSelectedLanguage(errors['about_me'], i18nData)}
          </Form.Control.Feedback>
        </span>

        <FloatingLabel controlId='floatingPassword'
          label={convertKeyToSelectedLanguage('passwd', i18nData)} className='mb-3 mt-3' >
          <Form.Control type='password' placeholder={convertKeyToSelectedLanguage('passwd', i18nData)}
            value={form.passwd} isInvalid={!!errors.passwd} autoComplete='off'
            onChange={e => { setField('passwd', e.target.value) }} />
          <Form.Text className='text-muted'>
            {convertKeyToSelectedLanguage('allowed_spec_char', i18nData)}
          </Form.Text>
          <Form.Control.Feedback type='invalid'>
            {convertKeyToSelectedLanguage(errors['passwd'], i18nData)}
          </Form.Control.Feedback>
        </FloatingLabel>

        <FloatingLabel controlId='floatingPasswordConfirm'
          label={convertKeyToSelectedLanguage('passwd_confirm', i18nData)} className='mb-3'>
          <Form.Control type='password' placeholder={convertKeyToSelectedLanguage('passwd_confirm', i18nData)}
            value={form.passwd_confirm} isInvalid={!!errors.passwd_confirm} autoComplete='off'
            onChange={e => { setField('passwd_confirm', e.target.value) }} />
          <Form.Control.Feedback type='invalid'>
            {convertKeyToSelectedLanguage(errors['passwd_confirm'], i18nData)}
          </Form.Control.Feedback>
        </FloatingLabel>

        <Alert key='danger' variant='danger' show={submitError !== null} onClose={() => setSubmitError(null)} dismissible >
          {convertKeyToSelectedLanguage(submitError, i18nData)}
        </Alert>
        <Alert key='success' variant='success' show={succesfullReg} onClose={() => setSuccesfullReg(false)} dismissible >
          {convertKeyToSelectedLanguage('succesfull_reg', i18nData)}
        </Alert>

        <Button type='submit' variant='secondary' className='col-md-6 offset-md-3 ' >
          {convertKeyToSelectedLanguage('register', i18nData)}
        </Button>
        <Nav variant='pills' activeKey='Login' className='mt-2'>
          <Nav.Link eventKey='Login' onClick={() => { navigate('/login') }} className='col-md-6 offset-md-3 text-center mb-5'>
            {convertKeyToSelectedLanguage('login', i18nData)}
          </Nav.Link>
        </Nav>

      </Form>
    </FormContainer >
  )
}
