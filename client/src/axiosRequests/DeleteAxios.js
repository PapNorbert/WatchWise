import axios from './configuredAxios'

export async function deleteRequest(url) {
  let error = true;
  let statusCode = null;
  let errorMessage = null;
  if (url !== null && url !== '') {
    try {
      const response = await axios.delete(url);
      statusCode = response.status;
      error = false;
    } catch (err) {
      if (!err.response) {
        // no response from server
        statusCode = 503; // service unavailable
        error = true;
        errorMessage = 'server_no_resp';
      } else {
        statusCode = err.response.status;
        if (statusCode === 400 || statusCode === 401 || statusCode === 404) {
          errorMessage = err.response.data.error;
        } else if (statusCode !== 404) {
          console.log('Error during post request', err.message);
        }
      }
    }
  } else {
    console.log('Error: Empty body or url');
  }
  return { error, errorMessage, statusCode }
}
